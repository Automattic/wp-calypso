NPM Lockfile
============

We use [`yarn.lock`](https://classic.yarnpkg.com/en/docs/yarn-lock/)
to lock down our dependency versions. This allows us to freeze all dependencies at the
exact version we have installed in our node_modules.

## Generating The Lockfile

Yarn will automattically generate and update the lock file whenever `yarn`, `yarn install` or `yarn add` is called. If you've manually updated a `package.json` file then Yarn will update the lock file as necessary.

## Testing

To verify that the new `yarn.lock` works:

- Run `yarn run distclean` to delete local `node_modules`
- Run `yarn install --frozen-lockfile`
- Verify that Calypso works as expected and that tests pass
