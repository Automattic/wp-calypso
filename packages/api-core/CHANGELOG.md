## 2.0.0

### Breaking Changes

- Rename the `read-spaces` resource to `read-shelves`, and its exports with it: `fetchReadSpaces` becomes `fetchReadShelves`, `fetchReadSpace` becomes `fetchReadShelf`, `fetchReadSpaceBySlug` becomes `fetchReadShelfBySlug`, and `canonicalizeReadSpaceSlug` becomes `canonicalizeReadShelfSlug` ([#113139](https://github.com/Automattic/wp-calypso/pull/113139)).

### Other changes

- Add resources: `admin-menu`, `agency-migrations`, `agency-products`, `agency-referrals`, `agency-site-tags`, `me-posts`, `site-admin-menu`, `woo-country-regions`, and `wordpress-agent`.

## 1.1.0

- Declare missing dependencies for published packages ([#112684](https://github.com/Automattic/wp-calypso/pull/112684)).

## 1.0.0

- Initial version of `@automattic/api-core`.
