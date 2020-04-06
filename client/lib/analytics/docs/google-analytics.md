Analytics: Google Analytics
===========================

We should use Google Analytics to record all events the user performs on a page that _do not_ trigger a page view (this will allow us to determine bounce rate on pages).

We are using Google Analytics to monitor user flows through the Calypso user interface in order to learn where they succeed and where they fail, as well as to determine the usage of different sections.

_Please do not ship anything that does not have Google Analytics tracking in place_, otherwise we will create big gaps in our understanding.

## Usage

In most situations, it is best to use the [Analytics Middleware](https://github.com/Automattic/wp-calypso/tree/master/client/state/analytics), which has no direct browser dependencies and therefore will not complicate any unit testing of the modules where it is used.

### `recordGoogleEvent( category, action [, label, value ] )`

```js
import { recordGoogleEvent } from 'state/analytics/actions';

dispatch( recordGoogleEvent( 'Reader', 'Loaded Next Page', 'page', 2 ) );
```

### `gaRecordEvent( category, action [, label, value ] )` (Deprecated)

_Note: Unless you have a strong reason to call `analytics.ga` directly, you should use the Analytics Middleware instead._

Record an event:

```js
import { gaRecordEvent } from 'lib/analytics/ga';

gaRecordEvent( 'Reader', 'Clicked Like' );
gaRecordEvent( 'Reader', 'Loaded Next Page', 'page', 2 );
```

For more information and examples about how and when to provide the optional `optionLabel` and `optionValue` parameters, refer to the [Google Analytics Event Tracking documentation](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#overview).


### `gaRecordPageView( url, title )` (Deprecated)

_Note: Unless you have a strong reason to directly record a page view to Google Analytics, you should use [`PageViewTracker`](./page-views.md) instead._

Record a virtual page view:

```js
import { gaRecordPageView } from 'lib/analytics/ga';

gaRecordPageView( '/posts/draft', 'Posts > Drafts' );
```

## Naming Conventions

We should categorize events by the section they are in. Examples are `Posts`, `Pages`, `Reader`, and `Sharing`.

We should write event actions in readable form, and use action-centric language. Good examples are `Clicked Save Button`, `Clicked Like`, and `Activated Theme`.

For page view tracking conventions, refer to the [Page Views](./page-views.md) documentation.
