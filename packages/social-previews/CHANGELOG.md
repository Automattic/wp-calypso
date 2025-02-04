# Changelog

## v2.1.0

- Added Threads and Bluesky preview
- Fixed media image URL for Tumblr and Instagram previews
- Removed the learn more link for link previews

## v2.0.1 (2024-06-10)

- Added Mastodon, Instagram and Nextdoor previews.
- Fixed hyperlinks for Facebook.
- Fixed multiple empty lines issue in preview text.
- Fixed video previews for Instagram and Tumblr.
- Fixed empty Twitter preview when no text/description is provided.
- Changed Twitter text and icon to X.
- Switch dependency from `classnames` to `clsx`.

## v2.0.0 (2023-05-24)

- Converted the package to TypeScript.
- Added LinkedIn and Tumblr previews.
- Updated Google Search, Facebook and Twitter previews to match their latest designs.
- Created separate components for each of the Social Media previews e.g. `TumblrLinkPreview`, `TumblrPostPreview` and `TumblrPreviews`.

## v1.1.5 (2022-08-24)

- Declare an optional peer dependency on `@babel/runtime`, for CommonJS environments. This dependency already existed previously, it just wasn't declared.

## v1.1.4 (2022-05-25)

- Add missing dependency on `@emotion/react`.

## v1.1.3 (2022-05-16)

- Remove unnecessary peer dependencies on `@wordpress/data`, `reakit-utils`, and `redux`.
- Add missing peer dependency on `react-dom`.

## v1.1.2 (2022-05-13)

- Dependency updates and internal code cleanup.

## v1.1.1 (2021-04-05)

- Ensure that lengthy text doesn't overflow in the Twitter preview.

## v1.1.0 (2020-09-10)

- Twitter: Add previewing for attached images, videos, or quoted tweets.
- Twitter: Add support for previewing entire threads.

## v1.0.4 (2020-08-24)

- Fixed Twitter styles for viewports < 600px in width

## v1.0.3 (2020-08-21)

- Refreshed styles of Twitter, Facebook and Google previews to match their latest design.

## v1.0.2 (2020-08-03)

- Remove `i18n-calypso` dependency by removing search preview header.
- Strip html tags from descriptions for social previews.
- Add helper function with enhanced regex for stripping html tags.

## v1.0.1 (2020-07-23)

- Mark CSS and SCSS files as `sideEffects` to ensure they are not discarded during build processes tree-shaking.

## v1.0.0 (2020-07-22)

- Initial release after extracting from Calypso.
