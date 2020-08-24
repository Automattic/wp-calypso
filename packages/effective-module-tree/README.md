# effective-module-tree

CLI tool that generates an ASCII tree with the representation of packages in `node_modules` and
their dependencies. This works over the actual `node_modules` files, so you need to install your
dependencies first (i.e. `npm install` or `yarn install`).

It generates the _logical_ representation of the tree. A package may appear multiple times if
it is depended on by multiple packages, even if all point to the same file on the filesystem.
In other words, it "un-hoist" hoisted/deduped packages.

## Why?

Usually, the package manger has a way to list the dependencies (`npm ls` or `yarn list`). However
this includes deduplicated packages, and requires the presence of the lock file to generate the
tree. This is the package manager's vision of the tree.

System tools like `ls`, `find` or `tree` can generate a similar output, but those represent the
filesystem view of the tree. Depending on how effective the package manager is hoisting dependencies,
this view may not be comparable.

`effective-module-tree` generates node's vision of the dependency tree. Is what node will find when
requiring dependencies, ignoring where the package physically live in the file system. This tree
should be consistent across package managers and different hoisting capabilities. As such, it can
be used to verify that the dependeny tree remains constant when migrating to a different package
manager.

## Usage

Run `effective-module-tree` in the root of your project.

Use `effective-module-tree --root <path>` to print the tree in a different project. Example:

```bash
effective-module-tree --root "./src/package.json"
```

This tool can generate either an ascii tree, or a list (easier to visualize dependency chains in
big trees). It can be specified with the flags `-o tree` or `-o list`.

Check out `effective-module-tree --help` for other flags and examples.

## Troubleshooting

Invoke the command with `DEBUG=effective-module-tree ./effective-module-tree` to get a verbose
log of what is going on.
