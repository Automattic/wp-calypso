Shrinkwrap
============
We use `npm shrinkwrap --dev` to lock down our dependency versions. This allows us to
freeze all dependencies at the exact version we have installed in our node_modules.

See: [shrinkwrap docs](https://docs.npmjs.com/cli/shrinkwrap)

## Modifying Dependencies

We use clingwrap to avoid creating huge diffs in npm-shrinkwrap.json. clingwrap also removes
`from` and `resolved` fields which is expected. If you need to update a package that is not published with npm, 
you will need to update the npm-shrinkwrap.json by hand.

- Install [clingwrap](https://github.com/goodeggs/clingwrap) globally: `npm install -g clingwrap`
- Update your desired package, e.g. `npm install lodash@4.0.0 --save`
- Clingwrap your updated package `clingwrap lodash`
- Verify that Calypso works as expected and that tests pass.
- Commit the updated package.json and npm-shrinkwrap.json

## Bumping Sub-Dependencies in a Single Package

Periodically, we'll want to bump our package sub-dependencies to pick up bugfixes.  To update sub-dependencies in a 
single module, (with lodash as an example) :

- Remove only that package in node_modules `rm -rf node_modules/lodash`
- Install the same version `npm install lodash@4.0.0 --save`
- Clingwrap the package `clingwrap lodash`
- Verify that Calypso works as expected and that tests pass.
- Commit the changes to npm-shrinkwrap.json.

## Bumping Sub-Dependencies in all Packages

We may also choose to update all package sub-dependencies. This will result in a large diff that is too big to review, 
so testing instructions should ensure that a clean install works and Calypso runs and tests correctly. It's very 
important that your node_modules is deleted before you do this to be sure to pick up the latest versions.

- Run `make distclean` to delete local node_modules
- Delete your local copy of npm-shrinkwrap.json.
- Run `npm install`
- Verify that Calypso works as expected and that tests pass.
- Run `npm shrinkwrap --dev`
- Commit the new npm-shrinkwrap.json

## Testing

To verify that the new npm-shrinkwrap.json works:

- Run `make distclean` to delete local node_modules
- Run `npm install`
- Verify that Calypso works as expected and that tests pass.
