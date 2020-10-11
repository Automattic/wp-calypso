# Themes State

When working with `themes` state, it is helpful to bear some assumptions in mind:

1. The relevant REST API endpoints return the same list of themes for any given WordPress.com site.
   There is also a site-agnostic endpoint, which we hence use to obtain that list once, and
   reuse it for any WP.com site.
2. The same isn't true for Jetpack sites, so we need to store lists of themes on a per-site basis there.

The themes state looks roughly like this (omitting less relevant parts):

```
themes: {
  activeThemes: {
    2916284: 'forthecause',
    77203074: 'twentysixteen',
    123415452: 'espresso'
  },
  queries: {
    2916284: {...},
    77203074: {...},
    wpcom: {...},
    wporg: {...}
  }
}
```

## `activeThemes`

The `activeThemes` tree contains one entry for each site a user has (no matter if hosted on WordPress.com, or a Jetpack-connected, self-hosted site). Its keys are the numerical `siteId`s, while the values are `themeId` strings.
Arguably, this duplicates information that is also found in the `sites` subtree (in `sites.items[ siteId ].options.theme_slug`). However, due to the way theme activation works (in particular after a premium theme is purchased), we've found that relying on that state is unreliable for our purposes.

## `queries`

Most per-theme information is stored in the `queries` tree. It has one subtree per Jetpack site (keyed by its numerical `siteId`), and additionally, one named `wpcom` (for all themes on WordPress.com), and one named `wporg` (for themes found on WordPress.org). These subtrees are populated by querying the corresponding REST API 'themes list/search' endpoints.
For retired themes, information obtained from the 'active theme' endpoint is stored in the `wpcom` subtree.

The value corresponding to each key is a [`ThemeQueryManager`](../../lib/query-manager/README.md). The corresponding state subtrees look roughly like this:

```
data: {
  items: {
    espresso: {...},
    mood: {...},
    twentyfifteen: {...},
    twentysixteen: {...}
  },
  queries: {
    []: {
      itemKeys: {...}
      found: 397
    },
    [["search","twenty"],["tier","free"]]: {
      itemKeys: {...}
      found: 9
    }
  }
}
```

This means that individual theme information (like theme name, description, screenshot link etc) is stored in the `items` object, while the `queries` object associates serialized queries with the corresponding themes (stored per theme ID in `itemKeys`).

## Jetpack Sites

Jetpack sites come with a REST API endpoint that triggers installation of a theme from either WordPress.org, or WordPress.com. To tell Jetpack which of either repository to use, we append a `-wpcom` suffix for WP.com themes. The suffix is then also present in the installed theme's ID (and directory name). There's another reason for that, which is to avoid collisions with existing themes in the WordPress.org repository -- otherwise, the WP.com theme would get overridden with a WP.org one of the same name by the self-hosted site's updater. Instead, downloaded WP.com themes include a little plugin that updates them from WP.com.

To the user, we hide the `-wpcom` suffix as much as possible, e.g a selector like `getActiveTheme()` will remove it from its return value. The reason is that we want the UX to be as seamless as possible: When a user is looking at the Theme Details Sheet for a WP.com theme for their Jetpack site, i.e. wordpress.com/theme/ixiom/example.com, and presses the 'Activate' button, we need the UI to update accordingly, e.g. change the button to 'Customize' after activation. Scenarios like this wouldn't be possible if we were exposing the suffix.

### Automated Transfer

There's one exception to the `-wpcom` suffix, which is Automated Transfer (AT) sites. While handled through Jetpack, the `-wpcom` suffix is absent from installed themes there, mostly to facilitate transfer of theme options from WordPress.com. The WordPress core updater isn't of any concern there. Instead, AT itself manages WP.com themes to be always up-to-date.

### Filtering of WP.com Themes on Jetpack Sites

Since our UI for Jetpack sites consists of an 'Uploaded Themes' and a 'WordPress.com Themes' list and we don't want to duplicate themes between them, we filter WP.com themes from a given Jetpack site's installed themes. Unfortunately, we cannot wholly treat this as an implementation detail at view level and filter there (after getting themes from Redux state), but have to do this right after receiving a themes list from the endpoint, in our `requestThemes()` action, _before_ storing it in Redux state (via `ThemeQueryManager`).

The reason is that `ThemeQueryManager` internally stores themes lists of fixed length for pagination reasons. Filtering themes from those lists when reading _from_ state would change those lengths and mess up pagination.
