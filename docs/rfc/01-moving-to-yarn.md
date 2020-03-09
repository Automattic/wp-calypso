# Moving to yarn

The goal of this RFC is detail how we'll move to yarn v2. to manage the monorepo.

## Description

The repository will be a monorepo handled by `yarn` + `lerna`. Support for multiple packages will come from
`yarn workspaces`, while `lerna` will provide a management layer on top of it to help with tasks like running
tests or releasing packages.

The project will have two main types of packages:

### Reusable packages

- These packages may be publised to NPM or consumed internall (or both).
- They will live under the folder `packages/`.
- They must declare their dependencies on its own `package.json`, including `devDependencies` required for testing
  and building the package.
- There must be only _one_ version of a package in the whole repo. If the package is a public package published to NPM,
  then the author of the new version is responsible to update _and release_ all other packages that depends on the original
  one.

### Apps

- These packages are not mean to be imported by anyone. Instead, they produce a final deplyable artifact.
- They live under the folder `apps/`.
- `wp-calypso` is an special app that lives under `client/` for historical reasons. For the purpose of this RFC, is
  a regular app.
- They must declare their dependencies on its own `package.json`, including `devDependencies` required for testing
  and building the app.

### Root of the project

The root `package.json` should not link all sub-packages. There is no need for that in `yarn`. It will only link other
sub-packages if it actually uses them.

The root of the project is in itself another package. It can have its own `dependencies` and `devDependencies` as
required. The purpose of this project is:

- Provide base configuration files used by most of the sub-packages (eg: base eslint config, common jest config...)
- Provide the scripts invoked via `yarn run ...`
- Provide tools that are, by definition, meant to be used across multiple packages (eg: a tool to keep versions in sync)

However, this root package should be quite thin. When in doubt, we should extract code to its own package. For example,
we should have packages with custom eslint rules, common jest mocks, etc.

## Duplicated packages

Note that it is ok-ish for _the monorepo_ to have duplicated packages. Given that the monorepo contains individual apps,
those apps may be node.js project where duplication is not as problematic as duplication on a client project. However,
because it makes things easier to manage, we'll try to minimize duplicated packages. For that, we'll use
`yarn-deduplicate` with the `highest` strategy.

That being said, individual projects focused on a client project (eg: `client/`) can use a different strategy for
deduplicating packages (or even offload that work to `webpack` or other tools).

In any case, automatic deduplication is a risky operation and we will have to consider case by case and do manual testing
as required.

## Implementation stages

- Write a post on calypsop2 announcing the change from npm to yarn. This should include a list of equivalent commands and link
  devs to yarn documentation or tutorials. Allow a few days so contriburos have a chance to raise concerns and we can address
  the feedback.

- Migrate `package-lock.json` to `yarn.lock`. We will verify that this results on an identical logical tree (no deps were added,
  deleted or changed).

- For each subpackage, ensure its `package.json` lists all dependencies and devDependencies (i.e. it doesn't rely on the root
  package.json)

- Remove unused dependencies/devDependencies from the root `package.json`

- Move to yarn v2 (https://yarnpkg.com/advanced/migration)

## Questions

### What if we allow multiple versions of internal packages in the same repo?

For example, imagine `packages/a` depends on `packages/b@1.0.0`, but `packages/b` in master is already in `2.0.0`.

This scenario presents a few problems:

- This produces a project where the source in `packages/a` may not be compatible with `packages/b`. However, a developer
  may not realize this and assume that `packages/a` and `packages/b` can work together, and risk spinning up the project
  with a set of versions that is not the same set that will be deployed to prod. This can yield from wasted time to
  bugs being shipped.

- If a package is reused by many other packages (eg: imagine `packages/button` being used by `packages/media-library`,
  `packages/tree-select`...) and we allow each consumer to have its own version of `packages/button`, this creates a
  a combinatorial explosion that can end up increasing the final bundle size a lot.

The downside is that creating a new version of `packages/button` may require updating and releasing other packages, making
it harder for consumers to stay up to date, and risking a lot of friction (specially if those "dependant" packages/apps
have non-standard testing/release procedures)

### What if we use the `fewer` strategy for yarn-deduplicate

Open question.
