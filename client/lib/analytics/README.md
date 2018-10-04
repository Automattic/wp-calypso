Analytics
=========

This module includes functionality for interacting with analytics packages.

Turn on debugging in the JavaScript developer console to view calls being made with the analytics module:

`localStorage.setItem('debug', 'calypso:analytics:*');`

You can limit to only calls made to Google Analytics, Tracks, or MC by replacing the `*` with an appropriate suffix. `ga` for Google Analytics, `tracks` for Tracks, `mc` for MC, and `ad-tracking` for Ad Tracking.

`localStorage.setItem('debug', 'calypso:analytics:tracks'); // only show debug for tracks`


## Which analytics tool should I use?

_Note: Each tool has its own documentation with extensive usage guidelines and examples._

[**Page Views**](./docs/page-views.md) should be used to record all page views (when the main content body completely changes). This will automatically record the page view to both Google Analytics and Tracks.

[**Google Analytics**](./docs/google-analytics.md) should be used to record all events the user performs on a page that *do not* trigger a page view (this will allow us to determine bounce rate on pages).

[**Tracks**](./docs/tracks.md) should be used to record events with optional properties.

[**MC**](./docs/mc.md) should be used to bump WP.com stats.

Automatticians may refer to internal documentation for more information about MC and Tracks.
