# eslint-plugin-smt

Rules that benefit from using an SMT solver.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-smt`:

```
$ npm install eslint-plugin-smt --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-smt` globally.

## Usage

Add `smt` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "smt"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "smt/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





