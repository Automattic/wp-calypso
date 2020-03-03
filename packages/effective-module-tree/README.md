# effective-module-tree

CLI tool that generates an ASCII tree with the representation of packages in `node_modules` and
their dependencies. This works over the actual `node_modules` files, so you need to install your
dependencies first (i.e. `npm install` or `yarn install`).

It generates the _logical_ representation of the tree. A package may appear multiple times if
it is depended on by multiple packages, even if all point to the same file on the filesystem.
In other words, it "un-hoist" hoisted/deduped packages.

Note that both `npm ls` and `yarn list` have some sort of deduplication so the output is not
complete.

This package can be used to validate that the dependeny tree remains constant when migrating to
a different package manager.

## Usage

Run `effective-module-tree` in the root of your project. You may want to redirect the output to
a file for better inspection (`effective-module-tree > packages`).

If there are missing dependencies, they will be printed in `stderr` as a warning. This can be
caused by missing packages in node_mdoules, or the script misdetecting `package.json` files as
packages (eg. from test fixtures).
