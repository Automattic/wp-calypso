Themes State
============

When working with `themes` state, it is helpful to bear some assumptions in mind:

1. The relevant REST API endpoints return the same list of themes for any given WordPress.com site.
   There is also a site-agnostic endpoint, which we hence use to obtain that list once, and
   reuse it for any WP.com site.

The themes state looks roughly like this (omitting less relevant parts):

```
themes: {
  queries: {
    2916284: {},
    77203074: {},
    wpcom: {},
    wporg: {}
  },
  activeThemes: {
    2916284: 'forthecause',
    77203074: 'ixion-wpcom',
    123415452: 'espresso'
  }
}
```

## `queries`

The most important bit is the `queries` subtree. It has one subtree per Jetpack site (keyed by its numerical `siteId`),
and additionally, one named `wpcom` (for all themes on WordPress.com), and one named `wporg` (for themes found on WordPress.org). These subtrees are populated by querying the corresponding REST API 'themes list/search' endpoints.
For retired themes, information obtained from the 'active theme' endpoint is stored in the `wpcom` subtree.

The value corresponding to each key is a [`ThemeQueryManager`](../../lib/query-manager/README.md).

## `activeThemes`

The `activeThemes` subtree contains one entry for each site a user has (no matter if hosted on WordPress.com, or a Jetpack-connected, self-hosted site). Its keys are the numerical `siteId`s, while the values are `themeId` strings.
Arguably, this duplicates information that is also found in the `sites` subtree (in `sites.items[ siteId ].options.theme_slug`). However, due to the way theme activation works (in particular after a premium theme is purchased), we've found that relying on that state is unreliable for our purposes.
