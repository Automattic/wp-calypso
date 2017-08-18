# Processors

An eslines processor is a regular [ESLint formatter](https://eslint.org/docs/developer-guide/working-with-custom-formatters).

ESLint does not allow for passing info to the formatters, so we use environment variables and a config file to pass them info. For compatibility reasons, we choose to stick to ESLint public API for the processors, so we can reuse them in other contexts and use them as a regular ESLint formatter:

    eslint --formatter=<eslines-processor>

## Naming processors

We want the processors to have names that communicate what they do. Our current naming space is:

* `filter-*` if the processor removes some rules from being considered.
* `downgrade-*` if the processor converts errors into warnings in a specific case.
* `enforce-*` if the processor converts warning into errors in a specific case.

We support composing processors, so we prefer they do one single thing.

## Existing processors

### downgrade-unmodified-lines

`downgrade-unmodified-lines` transforms ESLint `errors` into `warnings` if they are reported in lines not modified within the current branch. It is possible to prevent some rules from being downgraded. We recommend doing this for the `no-unused-vars` rule because this is one case where changing one line can cause a linting error in another.

Config:

* `remote`: the lines modified are determined by comparing the current git HEAD against the git remote. By default, will use `origin/master` if none configured. When running eslines from the CLI, you may choose a different diff strategy at run-time: either compare git HEAD against the remote or against the git index, as to allow using eslines in pre-commit git hooks.
* `rulesNotToDowngrade`: array of valid [ESLint rule ids](https://eslint.org/docs/rules/). Any rule declared in this array won't be downgraded to `warning`, provided that they are declared as an ESLint `error`. If the rule is declared as a `warning` it won't be transformed into an `error` - if that's your goal you may want to use the `enforce` processor.

Example:

    "downgrade-unmodified-lines": {
        "remote": "origin/master",
        "rulesNotToDowngrade": ["no-unused-vars"]
    },

### filter-parsing-errors

`filter-parsing-errors` takes the ESLint report and outputs a new one containing only JavaScript parsing Errors. [More about parsing errors in ESLint](https://github.com/automattic/eslines/blob/master/HACKING.md#eslint-parsing-errors).

No config needed.

### enforce

`enforce` transforms `warnings` into `errors` for a subset of rules.

Config options:

* `rules`: array of valid [ESLint rule ids](https://eslint.org/docs/rules/). Any rule declared in this array will be transformed into an `error`.

Example config:

    enforce": {
        "rules": ["max-len"]
    }
