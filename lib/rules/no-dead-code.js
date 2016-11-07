"use strict";

var util = require("../util");

// var smt2 = require("node-smt2");

module.exports = function (context) {

    // globals
    // var formula = new smt2.formula.Formula();

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

        "FunctionExpression": function (node) {
            util.traceEnter(node, context);
        },
        "FunctionExpression:exit": function (node) {
            util.traceExit(node, context);
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

        "VariableDeclarator": function (node) {
            util.traceEnter(node, context);
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
        },
        "Program:exit": function (node) {
            util.traceExit(node, context);
        },

        // function declarations
        "FunctionDeclaration": function (node) {
            util.traceEnter(node, context);
        },
        "FunctionDeclaration:exit": function (node) {
            util.traceExit(node, context);
        },

        // blocks
        "BlockStatement": function (node) {
            util.traceEnter(node, context);
        },
        "BlockStatement:exit": function (node) {
            util.traceExit(node, context);
        },
        "ExpressionStatement": function (node) {
            util.traceEnter(node, context);
        },
        "ExpressionStatement:exit": function (node) {
            util.traceExit(node, context);
        },

        // function calls
        "CallExpression": function (node) {
            util.traceEnter(node, context);
        },
        "CallExpression:exit": function (node) {
            util.traceExit(node, context);
        }
    };
};

module.exports.schema = [
];
