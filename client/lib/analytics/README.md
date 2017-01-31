Analytics
=========

This module includes functionality for interacting with analytics packages.

Turn on debugging in the JavaScript developer console to view calls being made with the analytics module:

`localStorage.setItem('debug', 'calypso:analytics:*');`

You can limit to only calls made to GA, Tracks, or MC by replacing the `*` with an appropriate suffix. `ga` for Google Analytics, `tracks` for Tracks, and `mc` for MC.

`localStorage.setItem('debug', 'calypso:analytics:tracks'); // only show debug for tracks`


## Which analytics tool should I use?

*Page Views* (`analytics.pageView.record`) should be used to record all page views (when the main content body completely changes). This will automatically record the pageview to both Google Analytics and Tracks.

*Google Analytics* should be used to record all events the user performs on a page that *do not* trigger a page view (this will allow us to determine bounce rate on pages).

We are using GA to monitor user flows through the user interface of Calypso in order learn where they succeed and fail, as well as determine usage of different sections. *Please do not ship anything that does not have GA tracking in place*, otherwise we will create big gaps in our understanding.

Automatticians may refer to internal documentation for more information about MC/Tracks.

# Usage

```js
// require the module
import analytics from 'lib/analytics';

```

## PageView Wrapper

### analytics#pageView#record( pageURL, pageTitle )

Record a pageview both in Google Analytics and Tracks:

```js
analytics.pageView.record( '/posts/draft', 'Posts > Drafts' );
```


## Google Analytics API

### analytics#ga#recordPageView( pageURL, pageTitle )

Record a virtual pageview:

```js
analytics.ga.recordPageView( '/posts/draft', 'Posts > Drafts' );
```

*Note: Unless you have a strong reason to directly record a pageview to GA, you should use `analytics.pageView.record` instead*

### analytics#ga#recordEvent( eventCategory, eventAction [, optionLabel, optionValue ] )

Record an event:

```js
analytics.ga.recordEvent( 'Reader', 'Clicked Like' );
analytics.ga.recordEvent( 'Reader', 'Loaded Next Page', 'page', 2 );
```

For more information and examples about how and when to provide the optional `optionLabel` and `optionValue` parameters, refer to the [Google Analytics Event Tracking documentation](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#overview).

## Tracks API

### analytics#tracks#recordEvent( eventName, eventProperties )

Record an event with optional properties:

```js
analytics.tracks.recordEvent( 'calypso_checkout_coupon_apply', {
	'coupon_code': 'abc123'
} );
```

## MC API

### analytics#mc#bumpStat( group, name )

Bump a single WP.com stat.

```js
analytics.mc.bumpStat( 'newdash_visits', 'sites' );
```

### analytics#mc#bumpStat( obj )

Bump multiple WP.com stats:

```js
analytics.mc.bumpStat( {
	'stat_name1': 'stat_value1',
	'statname2': 'stat_value2'
} );
```

## Google Analytics Naming Conventions

For page view tracking, you should never pass a dynamic URL, or anything including a specific domain e.g. (/posts/example.wordpress.com). Always pass a placeholder in these instances (/posts/:site). If you do not do this, we cannot accurately track views for a specific page. Titles should always use a ` > ` to break up the hierarchy of the page title. Examples are `Posts > My > Drafts`, `Reader > Following > Edit`, `Sharing > Connections`.

Events should be categorized by the section they are in. Examples are `Posts`, `Pages`, `Reader`, `Sharing`. Event actions should be written in readable form, and action centric. Good examples are `Clicked Save Button`, `Clicked Like`, `Activated Theme`.

## Tracks Naming Conventions

Event names should be prefixed by `calypso_` to make it easy to identify when analyzing the data with our various analytics tools.

Each token in the event and property names should be separated by an underscore (`_`), not spaces or dashes.

In order to keep similar events grouped together when output in an alphabetized list (as is typical with ananlytics tools), put the verb at _the end_ of the event name:

* `calypso_cart_product_add`
* `calypso_cart_product_remove`

If we had instead used `calypso_add_cart_product` and `calypso_remove_cart_product` for example, then they'd likely be separated in a list of all the event names.

Finally, for consistency, the verb at the end should be in the form `add`, `remove`, `view`, `click`, etc and _not_ `adds`, `added`, `adding`, etc.

With the exception of separating tokens with underscores, these rules do not apply to property names. `coupon_code` is perfectly fine.
