Shrinkwrap
============
We use
[`npm-shrinkwrap.json`](https://github.com/Automattic/wp-calypso/blob/master/npm-shrinkwrap.json)
to lock down our dependency versions. This allows us to freeze all dependencies at the
exact version we have installed in our node_modules. Note that we use a couple of other
tools rather than running `npm shrinkwrap` directly, since we have a mirror `npm` registry
and therefore need to avoid adding the `from` and `resolved` fields that `npm shrinkwrap`
[uses by default](https://github.com/npm/npm/issues/6444).

See also: [shrinkwrap docs](https://docs.npmjs.com/cli/shrinkwrap)

## npm 3

npm 3 [resolves dependencies differently](https://docs.npmjs.com/how-npm-works/npm3) than npm 2. Specifically:
- the position in the directory structure no longer predicts the type (primary, secondary, etc) a dependency is
- dependency resolution depends on install order, or the order in which things are installed will change the node_modules 
directory tree structure

With the upgrade to npm 3, if we make any dependency changes in package.json, we need to regenerate the entire 
npm-shrinkwrap.json file.

Testing instructions should ensure that a clean install works and Calypso runs and tests correctly. 

## Generating npm-shrinkwrap.json

- (Optional) Modify package.json. For example: `npm install --save lodash@4.11.1` or `npm uninstall --save left-pad`
- Install [shonkwrap](https://github.com/skybet/shonkwrap) globally: `npm install -g shonkwrap`. This package attempts
to remove the from/resolved fields if possible.
- Run `make shrinkwrap` to generate a new npm-shrinkwrap.json
- Verify that Calypso works as expected and that tests pass.
- Commit the new npm-shrinkwrap.json and any changes to package.json

Internally the script does the following:
- Deletes local node_modules
- Deletes your local copy of npm-shrinkwrap.json.
- Runs `npm install --no-optional` twice. Due to npm 3 quirks, we need to call this twice before packages fully resolve themselves.
- Runs `shonkwrap --dev` to generate a new npm-shrinkwrap.json.

## Testing

To verify that the new npm-shrinkwrap.json works:

- Run `make distclean` to delete local node_modules
- Run `npm install`
- Verify that Calypso works as expected and that tests pass.
