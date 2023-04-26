<div style="width: 45%; float:left" align="left"><a href="./debugging.md"><-- Debugging</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>

<br><br>

# Troubleshooting

<!-- TOC -->

- [Troubleshooting](#troubleshooting)
  - [git pre-commit hook/husky](#git-pre-commit-hookhusky)
  - [Package 'lcms2', required by 'vips', not found](#package-lcms2-required-by-vips-not-found)

<!-- /TOC -->

## git pre-commit hook/husky

If running `git commit` shows the following:

```
husky > pre-commit (<node_version>)
error Command "install-if-no-packages" not found.
husky > pre-commit hook failed (add --no-verify to bypass)
```

Solution:

1. remove all instances of `node_module` folder (if present):

```
cd <repo_root>test/e2e
find . -name 'node_modules' type -d -prune
rm -rf node_modules
```

2. return to the <repo_root> and install all dependencies from there:

```
yarn install
```

Once complete, running `git commit` should no longer trigger the git pre-commit hook error.
