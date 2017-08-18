# eslines

`eslines` helps you to post-process an ESLint JSON report.

## History

Originally, the project was created to downgrade errors into warnings if they were reported in lines not modified within the current git branch - hence the name.

This approach helped us to set all our ESLint rules to errors without the need to immediately fix all the linting errors in our codebase. Our linting tools (pre-commit hooks, continuous integration, etc) only reported errors in lines that were modified by a branch. All new code needed to adhere to the current linting standards, but legacy code could be migrated gradually - helping to evolve the linting standards as well.

Nowadays, it has grown to support more options than that.

## How to use it

Install it:

	npm install eslines

Add the default `.eslines.json` config file to your git repo:

    {
        "branches": {
            "default": ["downgrade-unmodified-lines"]
        },
        "processors": {
            "downgrade-unmodified-lines": {
                "remote": "origin/master",
                "rulesNotToDowngrade": ["no-unused-vars"]
            }
        }
    }

Run it:

	eslint -f json . | eslines

The resulting report will transform any ESLint `error` into a `warning` if it is reported in lines not modified within the current branch. The `no-unused-vars` rule won't be downgraded, though - this is one case where changing one line can cause a linting error in a different one so we recommend preventing it from downgrading.

If you rather use node-like pipes, check the [eslint-eslines](https://github.com/Automattic/eslint-eslines) utility.

## Config file

`eslines` reads its configuration from a file named `.eslines.json` placed in the root of your git repository. Out of the box, it comes with three ways of post-processing an ESLint report - we call them *processors*: `downgrade-unmodified-lines`, `filter-parsing-errors`, `enforce`.

Example config:

	{
		"branches": {
			"default": ["downgrade-unmodified-lines", "enforce"],
			"master": ["filter-parsing-errors"],
			"my/topic-branch": ["filter-parsing-errors"]
		},
		"processors": {
			"downgrade-unmodified-lines": {
				"remote": "origin/master",
				"rulesNotToDowngrade": ["no-unused-vars"]
			},
			"enforce": {
				"rules": ["max-len"]
			}
		}
	}

With the above configuration, the linting process will report only JavaScript parsing errors when running on a git branch called `master` or `my/topic-branch`. For other branches, `eslines` will report any `max-len` or `no-unused-vars` break, plus any error in lines modified within the current branch (provided that `no-unused-vars` is defined as an error in ESLint).

* **branches**: tell `eslines` which processors to use by default and which ones to use for particular branches. If none is set, it'll use `downgrade-unmodified-lines`.

* **processors**: each processor may have its own configuration. [Detailed info](https://github.com/automattic/eslines/blob/master/src/processors/README.md).

## Runtime options

The `eslines` Command Line Interface has the following options:

* **--diff** or **-d**: let you choose between two diff strategies for the `downgrade-unmodified-lines` processor

	* `index`: to diff HEAD against the git index.
	* `remote`: to diff HEAD against the git remote. This is the default.


* **--format** or **-f**: set any ESLint formatter as the output for `eslines`. `stylish` will be used by default.

* **--processors** or **-p**: choose one or several `eslines` processors at run-time. `downgrade-unmodified-lines` will be used by default. Processors can be composed by separating them with commas such as `--processors downgrade-unmodified-lines,enforce`.

* **--quiet**: report errors only.

Some examples:

to get a report with `junit` format containing only the parsing errors

	eslint -f json . | eslines -p parsing-errors -f junit

to get a report containing errors in lines modified within files at the git index

	eslint -f json . | eslines -d index


## How to contribute

See [HACKING.md](https://github.com/automattic/eslines/blob/master/HACKING.md) and [Processors.md](https://github.com/automattic/eslines/blob/master/src/processors/README.md).
