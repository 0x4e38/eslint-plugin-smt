"use strict";

// node dependencies
var assert = require("assert");

// external dependencies
var z3str2 = require("node-z3str2");
var smt2   = require("node-smt2");

// local dependencies
var util = require("../util");
var ast  = require("../ast");

// constants
var INJECTIONS = [
    ";a"
];
var VECTOR_NAME = "vector";

// NOTE:
//      key:   a method vulnerable to injection
//      value: a function that returns the arguments to that method that
//             can contain injections (i.e. vector variables)
var VULNERABLE_CALLS = {
    "shelljs.exec": {
        getVectors: function (args) {
            var vectors = [];

            switch (args.length) {
                default:
                case 1: {
                    vectors.push(args[0]);
                    break;
                }
                case 0: {
                    break;
                }
            }
            return vectors;
        }
    },
    "child_process.exec": {
        getVectors: function (args) {
            var vectors = [];

            switch (args.length) {
                default:
                case 1: {
                    vectors.push(args[0]);
                    break;
                }
                case 0: {
                    break;
                }
            }
            return vectors;
        }
    },
    "child_process.execSync": {
        getVectors: function (args) {
            var vectors = [];

            switch (args.length) {
                default:
                case 1: {
                    vectors.push(args[0]);
                    break;
                }
                case 0: {
                    break;
                }
            }
            return vectors;
        }
    },
    "child_process.spawn": {
        getVectors: function (args) {
            var vectors = [];

            switch (args.length) {
                default:
                case 2: {
                    if (args[1].type === "ArrayExpression") {
                        vectors = vectors.concat(args[1].elements);
                    }
                    vectors.push(args[0]);
                    break;
                }
                case 1: {
                    vectors.push(args[0]);
                    break;
                }
                case 0: {
                    break;
                }
            }
            return vectors;
        }
    },
    "child_process.spawnSync": {
        getVectors: function (args) {
            var vectors = [];

            switch (args.length) {
                default:
                case 2: {
                    if (args[1].type === "ArrayExpression") {
                        vectors = vectors.concat(args[1].elements);
                    }
                    vectors.push(args[0]);
                    break;
                }
                case 1: {
                    vectors.push(args[0]);
                    break;
                }
                case 0: {
                    break;
                }
            }
            return vectors;
        }
    }
};

module.exports = function (context) {

    // globals
    var formula = new smt2.formula.Formula();

    // helpers
    function getUsedNames(node) {
        switch (node.type) {
            case "Literal": {
                return [];
            }
            case "Identifier": {
                return [node.name];
            }
            case "MemberExpression": {
                return [util.nodeToString(node, context)];
            }
            case "BinaryExpression": {
                return getUsedNames(node.left).concat(getUsedNames(node.right));
            }
            case "CallExpression": {
                var calleeVars    = getUsedNames(node.callee);
                var argumentsVars = [];

                for (var i = node.arguments.length - 1; i >= 0; i--) {
                    var arg = node.arguments[i];

                    argumentsVars = argumentsVars.concat(getUsedNames(arg));
                }

                return calleeVars.concat(argumentsVars);
            }
            default: {
                throw Error(util.unsupportedNodeType("getting used names from", node.type));
            }
        }
    }

    function evaluateFormula() {

        // push a solution request onto the formula
        formula.solve();

        var formulaString = formula.toString();
        var assignments   = null;

        // try to solve the formula
        try {
            assignments = z3str2.solveSync(formulaString);
        } catch (e) {
            console.error(e.stack);
        }

        // remove solution request
        formula.unsolve();

        return assignments;
    }

    function isDangerousCall(callExpression) {

        // get the callee as a string
        var callee       = callExpression.callee;
        var calleeString = util.nodeToString(callee, context);

        // return true if the callee is in the list of unsafe functions
        if (VULNERABLE_CALLS[calleeString]) {
            return true;
        }
        return false;
    }

    function findInjection(vector) {
        formula.enterScope();

        // the injection to return
        var possibleInjection = null;

        // declare the vector as a variable
        formula.declare(VECTOR_NAME);
        formula.assign(VECTOR_NAME, vector);

        // see if it can contain any injections
        for (var i = 0; i < INJECTIONS.length; i++) {

            // add the injection clause
            var injection         = INJECTIONS[i];
            var injectionCl       = smt2.cl.literal(injection);
            var containsInjection = smt2.cl.contains(VECTOR_NAME, injectionCl);

            formula.assert(containsInjection);

            // find solution
            var assignments = evaluateFormula();

            // if a solution was found, populate the injection
            if (assignments !== null) {
                var vulnerableVariables = getUsedNames(vector);

                for (var j = 0; j < assignments.length; j++) {
                    var assignment       = assignments[j];
                    var assignedVariable = assignment.name;

                    // if the assignment is for a variable
                    // in the vector, return it
                    if (vulnerableVariables.indexOf(assignedVariable) !== (-1)) {
                        possibleInjection = assignment;
                        break;
                    }
                }

                // sanity check: at least one variable from the vector
                // should have had an assignment (with an injection) for it
                // in the solution because the solution returned SAT
                assert(possibleInjection !== null, "SAT means there is an injection");
            }

            // util.inspect(vector, context, formula);

            // remove the injection
            formula.unassert(containsInjection);
        }

        formula.exitScope();

        return possibleInjection;
    }

    function injectionMessage(callString, name, value) {
        return "unsafe " + callString + " call; " + name + " can be \"" + value + "\"";
    }

    function checkForInjections(callExpression) {

        // get parts of expression
        var callee = callExpression.callee;
        var args   = callExpression.arguments;

        // get the vulnerable args (i.e. the vectors)
        var callString = util.nodeToString(callee, context);
        var getVectors = VULNERABLE_CALLS[callString].getVectors;
        var vectors    = getVectors(args);

        // check each vector
        for (var i = 0; i < vectors.length; i++) {

            // try to find an injection
            var vector    = vectors[i];
            var injection = findInjection(vector);

            // report the injection if it was found
            if (injection !== null) {
                var message = injectionMessage(callString, injection.name, injection.value);

                context.report({
                    message: message,
                    node:    callExpression
                });
            }
        }
    }

    // public API
    return {

        "Expression": function (node) {
            util.traceEnter(node, context);
        },
        "Expression:exit": function (node) {
            util.traceExit(node, context);
        },

        "Pattern": function (node) {
            util.traceEnter(node, context);
        },
        "Pattern:exit": function (node) {
            util.traceExit(node, context);
        },

        "Identifier": function (node) {
            util.traceEnter(node, context);
        },
        "Identifier:exit": function (node) {
            util.traceExit(node, context);
        },

        "Statement": function (node) {
            util.traceEnter(node, context);
        },
        "Statement:exit": function (node) {
            util.traceExit(node, context);
        },

        "NewExpression": function (node) {
            util.traceEnter(node, context);
        },
        "NewExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "Function": function (node) {
            util.traceEnter(node, context, true);
        },
        "Function:exit": function (node) {
            util.traceExit(node, context, true);
        },

        "EmptyStatement": function (node) {
            util.traceEnter(node, context);
        },
        "EmptyStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "DebuggerStatement": function (node) {
            util.traceEnter(node, context);
        },
        "DebuggerStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "Declaration": function (node) {
            util.traceEnter(node, context);
        },
        "Declaration:exit": function (node) {
            util.traceExit(node, context);
        },

        "ThisExpression": function (node) {
            util.traceEnter(node, context);
        },
        "ThisExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "Literal": function (node) {
            util.traceEnter(node, context);
        },
        "Literal:exit": function (node) {
            util.traceExit(node, context);
        },

        "RegExpLiteral": function (node) {
            util.traceEnter(node, context);
        },
        "RegExpLiteral:exit": function (node) {
            util.traceExit(node, context);
        },

        "WithStatement": function (node) {
            util.traceEnter(node, context);
        },
        "WithStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "ReturnStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ReturnStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "LabeledStatement": function (node) {
            util.traceEnter(node, context);
        },
        "LabeledStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "BreakStatement": function (node) {
            util.traceEnter(node, context);
        },
        "BreakStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "ContinueStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ContinueStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "IfStatement": function (node) {
            util.traceEnter(node, context);
        },
        "IfStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "SwitchCase": function (node) {
            util.traceEnter(node, context);
        },
        "SwitchCase:exit": function (node) {
            util.traceExit(node, context);
        },

        "SwitchStatement": function (node) {
            util.traceEnter(node, context);
        },
        "SwitchStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "ThrowStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ThrowStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "CatchClause": function (node) {
            util.traceEnter(node, context);
        },
        "CatchClause:exit": function (node) {
            util.traceExit(node, context);
        },

        "TryStatement": function (node) {
            util.traceEnter(node, context);
        },
        "TryStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "WhileStatement": function (node) {
            util.traceEnter(node, context);
        },
        "WhileStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "DoWhileStatement": function (node) {
            util.traceEnter(node, context);
        },
        "DoWhileStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "ForStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ForStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "ForInStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ForInStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        "ArrayExpression": function (node) {
            util.traceEnter(node, context);
        },
        "ArrayExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "Property": function (node) {
            util.traceEnter(node, context);
        },
        "Property:exit": function (node) {
            util.traceExit(node, context);
        },

        "ObjectExpression": function (node) {
            util.traceEnter(node, context);
        },
        "ObjectExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "UnaryExpression": function (node) {
            util.traceEnter(node, context);
        },
        "UnaryExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "UpdateExpression": function (node) {
            util.traceEnter(node, context);
        },
        "UpdateExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "BinaryExpression": function (node) {
            util.traceEnter(node, context);
        },
        "BinaryExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "AssignmentExpression": function (node) {
            util.traceEnter(node, context);
        },
        "AssignmentExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "LogicalExpression": function (node) {
            util.traceEnter(node, context);
        },
        "LogicalExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "MemberExpression": function (node) {
            util.traceEnter(node, context);
        },
        "MemberExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "ConditionalExpression": function (node) {
            util.traceEnter(node, context);
        },
        "ConditionalExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        "SequenceExpression": function (node) {
            util.traceEnter(node, context);
        },
        "SequenceExpression:exit": function (node) {
            util.traceExit(node, context);
        },

        // program
        "Program": function (node) {
            util.traceEnter(node, context);
            ast.enterJSScope(node, context, formula);
        },
        "Program:exit": function (node) {
            util.traceExit(node, context);
            ast.exitJSScope(node, context, formula);
        },

        // declarators and declarations
        "VariableDeclarator": function (node) {
            util.traceEnter(node, context);
            formula.declare(node.id);
            if (node.init !== null) {
                formula.assign(node.id, node.init);
            }
        },
        "VariableDeclarator:exit": function (node) {
            util.traceExit(node, context);
        },
        "VariableDeclaration": function (node) {
            util.traceEnter(node, context);
        },
        "VariableDeclaration:exit": function (node) {
            util.traceExit(node, context);
        },

        // function expressions and declarations
        "FunctionDeclaration": function (node) {
            util.traceEnter(node, context);

            var functionName   = node.id;
            var functionParams = node.params;

            formula.declare(functionName);

            ast.enterJSScope(node, context, formula);

            for (var i = 0; i < functionParams.length; i++) {
                var param = functionParams[i];

                formula.declare(param);
            }
        },
        "FunctionDeclaration:exit": function (node) {
            util.traceExit(node, context);
            ast.exitJSScope(node, context, formula);
        },

        "FunctionExpression": function (node) {
            util.traceEnter(node, context);
            ast.enterJSScope(node, context, formula);

            for (var i = 0; i < node.params.length; i++) {
                var param = node.params[i];

                formula.declare(param);
            }
        },
        "FunctionExpression:exit": function (node) {
            util.traceExit(node, context);
            ast.exitJSScope(node, context, formula);
        },

        // blocks
        "BlockStatement": function (node) {
            util.traceEnter(node, context);
            ast.enterBlock(node, context, formula);
        },
        "BlockStatement:exit": function (node) {
            util.traceExit(node, context);
            ast.exitBlock(node, context, formula);
        },

        // expressions
        "ExpressionStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ExpressionStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        // calls
        "CallExpression": function (node) {
            util.traceEnter(node, context);
        },
        "CallExpression:exit": function (node) {
            util.traceExit(node, context);

            if (isDangerousCall(node)) {
                checkForInjections(node);
            }
        }
    };
};

module.exports.schema = [
];
