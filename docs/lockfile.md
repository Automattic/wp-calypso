NPM Lockfile
============

We use [`package-lock.json`](https://github.com/Automattic/wp-calypso/blob/master/package-lock.json)
to lock down our dependency versions. This allows us to freeze all dependencies at the
exact version we have installed in our node_modules.

## Generating The Lockfile

If you don't edit `package.json` directly, you shouldn't need to do anything. For example, if you run `npm install --save left-pad`,
the `package-lock.json` file will be updated automatically.

If you edit `package.json` manually, or you want to bump all our transitive dependencies to their most recent version,
you'll need to run `npm run update-deps` (that will take a while). Internally, the script does the following:
- Deletes local `node_modules` folders in all packages
- Deletes your local copy of `package-lock.json`
- Runs `npm install`
- Makes sure that all URLs in `resolved` fields are HTTPS. For some reason, NPM sometimes resolves packages from HTTP URLs

## Testing

To verify that the new `package-lock.json` works:

- Run `npm run distclean` to delete local `node_modules`
- Run `npm ci`
- Verify that Calypso works as expected and that tests pass
