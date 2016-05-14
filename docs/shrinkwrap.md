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

Before generating the npm-shrinkwrap.json:
- Make sure your node/npm version matches the versions listed in package.json under engines
- Delete your local node_modules
- Delete your local copy of npm-shrinkwrap.json before running `npm install`

Testing instructions should ensure that a clean install works and Calypso runs and tests correctly. It's very 
important that your node_modules is deleted before you do this to be sure to pick up the latest versions.

## Generating npm-shrinkwrap.json

- Install [shonkwrap](https://github.com/skybet/shonkwrap) globally: `npm install -g shonkwrap`. This package attempts
to remove the from/resolved fields if possible.
- (Optional) Modify package.json. For example: `npm install --save lodash@4.11.1` or `npm uninstall --save left-pad`
- Run `make distclean` to delete local node_modules
- Delete your local copy of npm-shrinkwrap.json.
- Run `npm install --no-optional`. Due to npm 3 quirks, you may need to run this twice for all packages to resolve themselves.
- Run `shonkwrap --dev` to generate a new npm-shrinkwrap.json. It is important that you do this
before `make run` so optional platform dependent dependencies are not baked into the new shrinkwrap file.
- Verify that Calypso works as expected and that tests pass.
- Commit the new npm-shrinkwrap.json and any changes to package.json

## Testing

To verify that the new npm-shrinkwrap.json works:

- Run `make distclean` to delete local node_modules
- Run `npm install`
- Verify that Calypso works as expected and that tests pass.
