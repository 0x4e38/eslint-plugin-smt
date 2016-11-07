/**
 * @fileoverview disallow dead code
 * @author Dmitry Blotsky
 * @copyright 2016 Dmitry Blotsky. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-dead-code"),

    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-dead-code", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "if (false) { console.log(\"I am dead.\"); }",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
