"use strict";

// constants
var INDENT     = "    ";
var TRACE      = "TRACE" in process.env;
var BAR_LENGTH = 100;
var BAR_CHAR   = "=";

var ANSI_CLEAR       = "\x1B[m";
var ANSI_INVERSE_ON  = "\x1B[7m";
var ANSI_INVERSE_OFF = "\x1B[27m";

// var ANSI_BG_RED    = "\x1B[41m";
// var ANSI_BG_GREEN  = "\x1B[42m";
// var ANSI_BG_YELLOW = "\x1B[43m";
// var ANSI_BG_PURPLE = "\x1B[45m";
var ANSI_BG_BLUE = "\x1B[44m";

var ANSI_BG_TRACE = ANSI_BG_BLUE;

// public API
function unsupported(message) {
    return "unsupported " + message;
}

function unsupportedNodeType(message, type) {
    return unsupported(message + " node of type " + type);
}

function fill(length, char) {
    return Array(length + 1).join(char);
}

function nodeToString(node, context) {
    return context.getSourceCode().getText(node);
}

function isGlobalScope(scope) {
    return scope.upper === null;
}

function inspect(startNode, context, formula) {

    console.error(ANSI_BG_TRACE);
    console.error(fill(BAR_LENGTH, BAR_CHAR));

    var ancestors = context.getAncestors(startNode);
    var indent    = "";

    // print out ancestors
    for (var i = 0; i < ancestors.length; i++) {
        var ancestor = ancestors[i];

        console.error(indent + ancestor.type);
        indent += INDENT;
    }

    // get tokens for this node
    var tokens = context.getTokens(startNode);

    // paint the tokens white
    tokens = tokens.map(function (token) {
        return ANSI_INVERSE_ON + token.value + ANSI_INVERSE_OFF;
    }).join(" ");

    console.error(indent + startNode.type + " " + tokens);

    // get startNode's scope
    var scope = context.getScope(startNode);

    // walk up scopes until we hit the global scope
    while (scope && !isGlobalScope(scope)) {

        // print scope
        console.error(indent + "(" + scope.type + " scope)");

        // print scope variables
        for (var j = 0; j < scope.variables.length; j++) {
            var variable     = scope.variables[j];
            var variableName = variable.name;

            // mark tainted variables
            if (variable in scope.taints) {
                variableName = " ! " + variableName;
            } else {
                variableName = "   " + variableName;
            }

            console.error(indent + variableName);
        }

        // go to the upper scope
        scope = scope.upper;
    }

    // print formula
    console.error(indent + " /-- formula");
    for (var k = 0; k < formula.clauses.length; k++) {
        var clause = formula.clauses[k];

        console.error(indent + " |- " + clause);
    }

    console.error(fill(BAR_LENGTH, BAR_CHAR));
    console.error(ANSI_CLEAR);
}

function indentNode(node, context) {
    var numIndents  = context.getAncestors(node).length;
    var indentation = fill(numIndents, INDENT);

    return indentation;
}

function trace(words, node, context, important) {
    if (!TRACE) {
        return;
    }

    words = (
        words + " " +
        ANSI_INVERSE_ON +
        nodeToString(node, context).replace(/\n/g, " ").slice(0, 50) +
        ANSI_INVERSE_OFF
    );

    if (important) {
        words = "\x1B[31m" + words + "\x1B[m";
    }
    console.error(indentNode(node, context) + words);
}

function traceEnter(node, context, name, important) {
    if (!name) {
        name = node.type;
    }
    trace("> " + name, node, context, important);
}

function traceExit(node, context, name, important) {
    if (!name) {
        name = node.type;
    }
    trace("< " + name, node, context, important);
}

function contains(array, object) {
    return array.indexOf(object) !== (-1);
}


// SOURCE:
//        http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
function startsWith(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
}

module.exports = {
    unsupported:         unsupported,
    unsupportedNodeType: unsupportedNodeType,
    nodeToString:        nodeToString,
    inspect:             inspect,
    fill:                fill,
    contains:            contains,
    startsWith:          startsWith,
    traceEnter:          traceEnter,
    traceExit:           traceExit
};
