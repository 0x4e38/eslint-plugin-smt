"use strict";

var path         = require("path");
var requireIndex = require("requireindex");

// import all rules in lib/rules
module.exports.rules = requireIndex(path.join(__dirname, "rules"));
