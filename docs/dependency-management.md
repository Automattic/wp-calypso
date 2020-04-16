# Dependency management

This project uses [yarn v1](https://classic.yarnpkg.com/lang/en/) to manage its dependencies. It uses `yarn workspaces` functionallity and [lerna](https://github.com/lerna/lerna) to manage the monorepo.


## Working with sub-packages

In this context, a 'sub-package' is any package of the monorepo. That includes `./packages/*`, `./client` and `./apps/*`.

With `yarn`, there are two different modes to work with a sub-package:

*Option 1:*

Go to the directory that contains the package and run regular yarn commands. Example:

```
cd packages/calypso-analytics
yarn add ...
```

*Option 2:*

Run `yarn` commands in teh root of the project, but prepend `workspace <packageName>`. Example

```
yarn workspace @automattic/calypso-analytics add...
```

Both options are equivalent, is a matter of personal preference. For the rest of this guide, the examples will follow Option 1.




## Common tasks


### Add a new dependency

```
cd <package-dir>
yarn add <dependency>

# Example:
# cd packages/calypso-analytics
# yarn add lodash
```

You should add dependencies to the root project _only_ when it will be used to test and/or build other packages. To do this, run:

```
yarn add -w <dependency>
```

### Delete a dependency

```
cd <package-dir>
yarn remove <dependency>

# Example:
# cd packages/calypso-analytics
# yarn remove lodash
```

To delete a dependency of the root project, run:

```
yarn remove -w lodash
```

### Update a dependency

Run

```
yarn upgrade <package>

# Example
# yarn upgrade sinon
```

Note that this won't change the required range of `sinon` (i.e. it won't modify `package.json`). Instead, it will try to update `sinon` and any of its dependencies to the highest version that satisfies the specified range.
For example, if we declare a dependency on `sinon@^7.5.0` it may update sinon to `7.5.1`, but never to `8.0.0`.


### Update a dependency to a new range

Run

```
yarn upgrade <package>@^<semver-range>

# Example
# yarn upgrade sinon@^9.0.0
```

As before, it will update `sinon` and all its dependencies. But in this case, it _will_ change the required range (i.e. it will modify `package.json`)


### List oudated dependencies

Run

```
yarn outdated
```

Note that the output includes which sub-package has the dependency. It is possible that the same dependency is present in many sub-packages (or even in the root project).


### List duplicated dependencies

Run

```
npx yarn-deduplicate --list
```

It is recommended to run this command after adding a new dependency and fix potential duplications with `npx yarn-deduplicate --package <duplicated-package>`


## Differences with `npm`

### Running scripts

When working with `yarn` we don't have to specify `run` in the command line:

```
# Before:
npm run build-client

# After:
yarn build-client
```

### Other

Check the [official documentation](https://classic.yarnpkg.com/en/docs/migrating-from-npm/#toc-cli-commands-comparison) to see more equivalences between `npm` and `yarn` commands.