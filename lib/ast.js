"use strict";

var assert = require("assert");

var smt2 = require("node-smt2");

var util = require("./util");

function enterIfStatement(node, context, formula) {

    // get nice names for relevant nodes
    var ifStatement = node.parent;
    var trueCase    = ifStatement.consequent;
    var falseCase   = ifStatement.alternate;
    var condition   = ifStatement.test;

    // sanity check: node must be one of the two sides of the if-statement
    assert(
        node === trueCase || node === falseCase,
        "node should be a branch of an if-statement"
    );

    // compute clause for if-statement's condition
    var conditionTrue  = smt2.clause.nodeToCl(condition, formula.sorts);
    var conditionFalse = smt2.clause.not(conditionTrue);

    // push a formula scope
    formula.enterScope();

    // assert the clause or its negation depending on which part
    // of the if-statement we're entering
    if (node === trueCase) {
        formula.assert(conditionTrue);
    } else if (node === falseCase) {
        formula.assert(conditionFalse);
    }
}

function exitIfStatement(node, context, formula) {
    formula.exitScope();
}

function enterBlock(node, context, formula) {
    var parent = node.parent;

    switch (parent.type) {
        case "IfStatement": {
            enterIfStatement(node, context, formula);
            break;
        }

        // unsupported cases
        case "FunctionDeclaration": {
            break;
        }
        case "FunctionExpression": {
            break;
        }
        case "ForStatement": {
            break;
        }
        case "WhileStatement": {
            break;
        }
        default: {
            throw Error(util.unsupportedNodeType("entering blocks under a", parent.type));
        }
    }
}

function exitBlock(node, context, formula) {
    var parent = node.parent;

    switch (parent.type) {
        case "IfStatement": {
            exitIfStatement(node, context, formula);
            break;
        }

        // unsupported cases
        case "FunctionDeclaration": {
            break;
        }
        case "FunctionExpression": {
            break;
        }
        case "ForStatement": {
            break;
        }
        case "WhileStatement": {
            break;
        }
        default: {
            throw Error(util.unsupportedNodeType("exiting blocks under a", parent.type));
        }
    }
}

// NOTE:
//      JS has function scope, so this should be called whenever
//      a new function is entered (e.g. on FunctionExpression, etc.)
function enterJSScope(node, context, formula) {
    formula.enterScope();
}

// NOTE:
//      this function basically only serves as a sanity check
function exitJSScope(node, context, formula) {
    formula.exitScope();
}

module.exports = {
    enterJSScope:     enterJSScope,
    exitJSScope:      exitJSScope,
    enterBlock:       enterBlock,
    exitBlock:        exitBlock,
    enterIfStatement: enterIfStatement,
    exitIfStatement:  exitIfStatement
};
