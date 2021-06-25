# Troubleshooting & Debugging

## Table of contents

<!-- TOC -->

- [Troubleshooting & Debugging](#troubleshooting--debugging)
  - [Table of contents](#table-of-contents)
  - [git pre-commit hook/husky](#git-pre-commit-hookhusky)

<!-- /TOC -->

## git pre-commit hook/husky

If running `git commit` shows the following:

```
husky > pre-commit (<node_version>)
error Command "install-if-no-packages" not found.
husky > pre-commit hook failed (add --no-verify to bypass)
```

Try the following:

1. remove all instances of `node_module` folder (if present):

```
cd <repo_root>test/e2e
find . -name 'node_modules' type -d -prune
rm -rf node_modules
```

2. return to the <repo_root> and install all dependencies from there:

```
npm run install-if-no-packages
```

Once complete, running `git commit` should no longer trigger the git pre-commit hook error.
