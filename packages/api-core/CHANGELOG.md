## Unreleased

- Breaking: Require `@wordpress/dataviews` ^22.1.0, `@wordpress/html-entities` ^5.2.0, `@wordpress/i18n` ^7.2.0 and `@wordpress/url` ^5.2.0.
- Breaking: Removed `'commerce-garden'` from `FetchSiteType`.
- Breaking: Removed the `garden` option from `fetchDomains()` and the `FetchDomainsOptions` type.
- Breaking: Removed `is_garden`, `garden_name`, `garden_partner` and `garden_is_provisioned` from `Site` and `SITE_FIELDS`.
- Breaking: Removed `garden_site_count` from `User`.
- Breaking: Removed the Reader Shelves fetchers, mutators and types (`fetchReadShelves()`, `createReadShelf()`, `ReadShelf` and the rest of `read-shelves`), along with `fetchReadShelfPosts()` and `fetchReadShelfDiscover()`.
- Breaking: Removed `fetchReadConversations()`.

## 1.0.0

- Initial version of `@automattic/api-core`.
