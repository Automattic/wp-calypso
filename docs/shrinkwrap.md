Shrinkwrap
============
We use `npm shrinkwrap --dev` to lock down our dependency versions. This allows us to
freeze all dependencies at the exact version we have installed in our node_modules.

See [shrinkwrap docs](https://docs.npmjs.com/cli/shrinkwrap)

## Modifying Dependencies

- In the root directory delete local node_modules
- Run `npm install`
- Update dependences and make sure it's saved to package.json. 
For example bumping lodash to 4.0.0 looks like `npm install lodash@4.0.0 --save`
- Validate that Calypso works as expected with and that tests pass.
- Run `npm shrinkwrap --dev`
- Commit the new npm-shrinkwrap.json

OR, to help reduce the file diff, use [clingwrap](https://github.com/goodeggs/clingwrap)

- Install clingwrap globally `npm install -g clingwrap`
- Update your desired package, e.g. `npm install lodash@4.0.0 --save`
- Clingwrap your updated package `clingwrap lodash`
- Validate that Calypso works as expected and that tests pass.
- Commit changes to the npm-shrinkwrap.json