# Organization of the repository

* within `src/lib/` you may find self-contained modules. They don't have access to config or environment variables.

* within `src/processors/` you may find regular ESLint formatters. They take a JSON report, filter/downgrade/enforce some rules and return a new one. They use specific pieces from `lib/` and have access to config and environment variables.

# Context about ESLint plugins VS formatters

During the research into developing this package, we learned some interesting things about ESLint plugins and formatters. Write some of the most interesting here, for the record.

### ESLint formatters VS plugins

An ESLint [plugin](http://eslint.org/docs/developer-guide/working-with-plugins) bundles a set of rules, environment variables, and processors. An ESLint formatter is something you pass as an argument to the CLI; there is no way to make it play together with the config file ([see](https://github.com/eslint/eslint/blob/master/lib/cli.js#L192) - `currentOptions.format` is the command line option `--format`). The ESLint team has already had some discussions around this:

* [move formatters into plugins](https://github.com/eslint/eslint/issues/3013#issuecomment-121780989)
* [have the ability to pass options to formatters](https://github.com/eslint/eslint/issues/2989)

### More than a formatter

There are situations where people needs to configure the formatter (for example, to set the colors or the file paths for a particular environment) or it needs to do more than an ESLint formatter is capable of (for example, modify the exit code of ESLint).

To work around this, sometimes, people encapsulates the call to ESLint in its own script ([eslint-nibble](https://github.com/IanVS/eslint-nibble), [eslint-pretty](https://github.com/bugeats/eslint-pretty)).

Other approaches that we have seen in practice while using ESLint directly are:

**[Recommended](https://github.com/eslint/eslint/issues/3013#issuecomment-122032581)**:

	eslint -f json . | formatter --your-options

By doing this, it is possible to control the exit code, for example.

**Common**

It is common that people pass info to the formatter by using environment variables or a dedicated config file for the formatter.

**Hacky**

There is a hacky way that depends on the fact that ESLint uses [optionator](https://www.npmjs.com/package/optionator) for parsing options from the command line - see, for example, [eslint-friendly-formatter](https://github.com/royriojas/eslint-friendly-formatter#formatter-parameters). The way this works is:

* ESLint uses optionator to parse command line arguments.

* Optionator provides an API to do `optionator.parse(process.argv)` (see [ESLint code](https://github.com/eslint/eslint/blob/master/lib/cli.js#L135)) that returns an object like `{opt1: 2, opt2:3, _: ['positional-param-1', 'positional-param-2']}` with keys being the options and any other [positional parameter](http://wiki.bash-hackers.org/scripting/posparams) added in the `_` array.

* ESLint uses the contents in the `_` array as the input files (but [discards any file that does not exist](https://github.com/eslint/eslint/blob/master/lib/util/glob-util.js#L165)).

* Optionator happen to follow the bash convention of using `--` as a marker for _[end of options](http://wiki.bash-hackers.org/dict/terms/end_of_options)_ so any value that follows that marker is considered a [positional parameter](http://wiki.bash-hackers.org/scripting/posparams). _example of the hack:_

    `command --opt1 2 --opt2 3 -- file-to-process-1 file-to-process-2 --opt3`

    for this command, `optionator.parse(process.argv)` would return`{opt1: 2, opt2:3, _: ['file-to-process-1', 'file-to-process-2', '--opt3']}`.

* eslint-friendly-formatter takes advantage of this hack (ESLint would not process --opt3 as that file does not exist) to [retrieve the command line options after the `--`](https://github.com/royriojas/eslint-friendly-formatter/blob/master/index.js#L99) marker and use them for its configuration.

## ESLint Parsing errors

ESLint manages parsing errors (improper JS) in the same way as any other. See this [debate](https://github.com/eslint/eslint/issues/3555) and [PR-3967](https://github.com/eslint/eslint/pull/3967).

Ways to identify a parsing error in an ESLint report:

* `ruleId=null`
* `message.startsWith=Parsing error`
* `fatal` key is present. This is the recommended way.

# How to get fixtures for testing

You may want to execute something like these commands from the root of you repository:

    git diff --src-prefix=$PWD/ --dst-prefix=$PWD/ -U0 $(git merge-base $(git rev-parse --abbrev-ref HEAD) origin/master)..HEAD > git.diff

    eslint --rule "space-in-parens: [ 2, 'always' ]" --rule 'max-len: [2, {code:140}]' -f json --ext=jsx --ext=js . > eslint.json

    eslint --rule "space-in-parens: [ 2, 'always' ]" --rule 'max-len: [2, {code:140}]' -f stylish --ext=jsx --ext=js . > eslint.stylish
