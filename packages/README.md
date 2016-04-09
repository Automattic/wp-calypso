# Packages

This directory contains modules that are independently published via npm. We are using a [mono-repo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) to keep these modules in a single codebase for ease of workflow and tooling.

We are using [lerna](https://github.com/kittens/lerna) to manage the release of these packages. As packages are created or updated and we use `lerna publish`, they are published with the latest version number from [VERSION](./VERSION).
