# Analytics

This module includes functionality for interacting with analytics packages.

Turn on debugging in the JavaScript developer console to view calls being made with the analytics module:

```
localStorage.setItem('debug', 'calypso:analytics*');
```

You can limit to only calls made to Google Analytics, Tracks, or MC by replacing `calypso:analytics*` with:

- `calypso:analytics` for Tracks
- `calypso:analytics:ga` for Google Analytics
- `calypso:analytics:mc` for MC

For example:

```
localStorage.setItem('debug', 'calypso:analytics'); // only show debug for Tracks
```

```
localStorage.setItem('debug', 'calypso:analytics:ga'); // only show debug for Google Analytics
```

## Which analytics tool should I use?

_Note: Each tool has its own documentation with extensive usage guidelines and examples._

[**Page Views**](./docs/page-views.md) should be used to record all page views (when the main content body completely changes). This will automatically record the page view to both Google Analytics and Tracks.

[**Google Analytics**](./docs/google-analytics.md) should be used to record all events the user performs on a page that _do not_ trigger a page view (this will allow us to determine bounce rate on pages).

[**Tracks**](./docs/tracks.md) should be used to record events with optional properties.

[**MC**](./docs/mc.md) should be used to bump WP.com stats.

Automatticians may refer to internal documentation for more information about MC and Tracks.

## What is the Analytics Queue?

The queue allows for delaying analytics events that would otherwise cause a race condition. For example, when we trigger `calypso_signup_complete` we're simultaneously moving the user to a new page via `window.location`. This is an example of a race condition that should be avoided by enqueueing the `calypso_signup_complete` event, and therefore running it on the next pageview.

When you add a new item to the queue, it is held in `localStorage` under the key `analyticsQueue`. This queue is read, then emptied, and then processed each time `recordPageView()` fires.

### Example of adding an item to the Queue

```
import { addToQueue } from 'lib/analytics/queue';

addToQueue( moduleName, trigger, arg1, arg2, ... );
```

- `moduleName` This is the name of the module where the queued method exists, e.g. `signup`.
  Available modules are configured in the `modules` constant in `queue.js`.
- `trigger` This can be any exported function in the chosen module.
- `arg1, arg2, ...` Optional. These are the arguments ultimately passed to the `trigger` function.

## Tracker Buckets

Tracker Buckets (`./tracker-buckets.ts`) is a simple mechanism that allows to categorize new tracker into one of three available categories: `essential`, `advertising`, and `analytics`.

After adding the tracker to `allAdTrackers` array, and assiging it a category in `AdTrackersBuckets` object - you may wrap the functionality of the given tracker with a check against the current user tracking preferences, that is based on Automattic-wide used cookie `sensitive_pixel_options`.

The code is fully typed in Typescript, so to ensure implementing new tracker is straightforward.

There are three checking functions:

- `mayWeTrackGeneral` - that checks if we can track user in general
- `mayWeTrackByBucket` (runs `mayWeTrackGeneral` underneath) - that checks if user has given consent to track with a specific bucket
- `mayWeTrackByTracker` (runs `mayWeTrackByBucket` underneath) - that checks if we can track user with a specific tracker (based on the bucket consent)
