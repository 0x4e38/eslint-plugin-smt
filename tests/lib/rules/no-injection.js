"use strict";

// external dependencies
var eslint = require("eslint");

// internal dependencies
var rule = require("../../../lib/rules/no-injection");

// run tests
var tester = new eslint.RuleTester();
tester.run("no-injection", rule, {

    valid: [
        "child_process.execSync(\"echo\")",
    ],

    invalid: [
        {
            code: "var tainted; child_process.execSync(\"echo \" + tainted);",
            errors: [{
                message: "unsafe child_process.execSync call; tainted can be \";ad\"",
                type: "CallExpression"
            }]
        }
    ]
});
