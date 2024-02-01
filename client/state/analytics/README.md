# Analytics Middleware

## Overview

Analytics track things. By their very nature they are side-effecting actions, usually by sending API calls to one or more analytics servers.

Calypso supports a variety of analytics methods including (but not limited to) Google Analytics, stat bumping, and Tracks events.

As we develop the different view components in React for Calypso, we should work hard to keep them as pure and simple as they can be. This brings with it many benefits, including the ability to easily test those components. Calling out these side-effecting operations can break those tests among other things.

_**Middleware**_ is a stage in the **Redux** pipeline that runs between dispatching an action and when that action runs through the reducers. By incorporating the side-effecting operations at this point, we decouple those breaking effects from the other parts of the app.

This module provides just such a middleware: it allows React components to now fire off Redux actions indicating the _intent_ to send an analytics metric instead of actually sending it, keeping the otherwise-unrelated dependencies out of the components.

## Usage

As this middleware follows the [Flux Standard Action](https://github.com/acdlite/flux-standard-action) pattern, you can start tracking analytics simply by adding a new `meta` block to your existing actions. A helper function `withAnalytics()` is provided to make this easy.

A suite of pure analytics action creators are also exposed which can be used in combination with `withAnalytics()` or by themselves if no other action beyond analytics tracking is required.

### Examples

```js
import {
	withAnalytics,
	bumpStat,
	recordGoogleEvent,
	recordTracksEvent,
	recordPageView,
} from 'calypso/state/analytics/actions';

// track a page-view
dispatch( recordPageView( '/path/to/page', 'Page Title' ) );

// add event-tracking to an action
dispatch(
	withAnalytics( recordGoogleEvent( 'selected_thing', 'my_thing' ), selectThing( myThing ) )
);

// withAnalytics() is auto-curried for convenience
const statBumper = withAnalytics( bumpStat( 'api_calls', 'success' ) );
dispatch( statBumper( apiSuccessAction() ) );

// works with pure actions and thunks
dispatch(
	withAnalytics(
		recordPageView( '/api/users', 'Fetch Users' ),
		fetchUsers( siteId ) // returns a thunk which makes an API call
	)
);

// passed as a component prop
const trackSelection = withAnalytics( recordTracksEvent( 'selected_page', { page: 'somePage' } ) );

const mapDispatchToProps = {
	selectPage: trackSelection( selectPage ),
	recordPageLoad: bumpStat( 'page_loaded', 'page_selected_page' ),
};
```

## API

`composeAnalytics :: [ Object ] -> Object`<br />
`composeAnalytics( ...analytics )`: Combines analytics actions by themselves into one multi-analytic-tracking action.

`withAnalytics :: Object -> ( Object | function ) -> ( Object | function )`<br />
`withAnalytics( analytics, action )`: Combines analytics action with other action. Can be called with two arguments, which returns a new action, or with only an `analytics` action, which returns a new function of a single argument taking an action. This curried form is useful for reusing a single analytics action with multiple other actions.

`bumpStat :: String -> String -> Object`<br />
`bumpStat( group, name )`: Creates an action to bump the stat with given group and name.

`recordGoogleEvent :: String -> String -> String* -> String* -> Object`<br />
`recordGoogleEvent( category, action, label, value )`: Creates an action to record an event in Google Analytics. The label and value arguments are optional.

`recordTracksEvent :: String -> Object -> Object`<br />
`recordTracksEvent( name, properties )`: Creates an action to record an event in Tracks. The properties object should contain name/value pairs for event properties to record.

`recordPageView :: String -> String -> Object`<br />
`recordPageView( url, title )`: Creates an action to record a page view in both Google Analytics _and_ in Tracks.

`recordGooglePageView :: String -> String -> Object`<br />
`recordGooglePageView( url, title )`: Creates an action to record a page view in Google Analytics.

`loadTrackingTool :: String -> String -> Object`<br />
`loadTrackingTool ( trackingTool )`: Creates an action to load a tracking tool that gets attached to the DOM on component mount. Pass tracking tool reference through to middleware and manage loading scripts there.

### Property Enhancers

The above Redux actions denote the analytics data object to be sent to Tracks. Properties to be reported often need to be passed to the actions as arguments. There are times when it would be convenient to enhance the analytics data object with universal properties that are applicable to all sorts of tracking calls. This is when Enhancers come in handy. To enhance any analytics Redux action with an additional property:

```
const recorder = withEnhancer( recordPageView, [ enhancer1, enhancer2, enhancer3,... ] );
```

#### [enhanceWithSiteType](https://github.com/Automattic/wp-calypso/tree/a2cc6fa5ee914e53e75e8eaf147bf1bac549b5e4/client/state/analytics/actions/enhance-with-site-type.js)

- Enhances any analytics Redux action
- Adds the property `site_type` specifying the selected site's type: `jetpack` or `wpcom`
- `site_type` is captured by default when tracking calls are handled by [`<PageViewTracker>`](https://github.com/Automattic/wp-calypso/blob/a2cc6fa5ee914e53e75e8eaf147bf1bac549b5e4/client/lib/analytics/page-view-tracker/index.jsx#L116)
- To include the `site_type` property in any other tracking calls, the respective analytics Redux action must be accompanied by `enhanceWithSiteType` ([example](https://github.com/Automattic/wp-calypso/blob/a2cc6fa5ee914e53e75e8eaf147bf1bac549b5e4/client/login/magic-login/index.jsx#L167))

#### [enhanceWithSiteMainProduct](https://github.com/Automattic/wp-calypso/tree/6ee89756f49d5e44551075aedfb2868e8fd144eb/client/state/analytics/actions/enhance-with-site-main-product.js)

- Enhances the `ANALYTICS_PAGE_VIEW_RECORD` action for `calypso_page_view` of email and purchase related pages (i.e. paths with prefix defined in `should-report-omit-site-main-product.js`)
- Adds the property `site_main_product` specifying the main product user set up in the current site
- `site` - User signed up for a website
- `domain` - User signed up for a domain-only "site", without any email subscription
- `email` - User signed up for a domain-only "site", with an email subscription
- `site_main_product` is captured by default when tracking calls are handled by [`<PageViewTracker>`](https://github.com/Automattic/wp-calypso/blob/6ee89756f49d5e44551075aedfb2868e8fd144eb/client/lib/analytics/page-view-tracker/index.jsx#L117)
- To include the `site_main_product` property in any other tracking calls, the respective analytics Redux action must be accompanied by [`enhanceWithSiteMainProduct`](https://github.com/Automattic/wp-calypso/blob/6ee89756f49d5e44551075aedfb2868e8fd144eb/client/my-sites/email/inbox/mailbox-selection-list/index.jsx#L226)

### enhanceWithUserIsDevAccount

- Enhances any analytics Redux action
- Adds the property `user_is_dev_account` (`0` or `1`) to specify whether the user has the `is_dev_account` ("I am a developer") setting enabled.
- `user_is_dev_account` is captured by default when tracking calls are handled by [`<PageViewTracker>`]
- To include the `user_is_dev_account` property in any other tracking calls, the respective analytics Redux action must be accompanied by `enhanceWithUserIsDevAccount`

### Internal Helpers

These can be used in client code but are intended to be used internally within the middleware library to create service-specific handlers for tracking analytics.

`recordEvent :: String -> Object -> Object`<br />
`recordEvent( service, args )`: Used to create event-tracking action-creators. The actions will be dispatched based on the `service` name and passed the `args` in the action payload.

`recordPageView :: String -> String -> String* -> Object`<br />
`recordPageView( url, title, service* )`: Creates an action to record a page view. If service is omitted, the default behavior is to record in both Google Analytics _and_ in Tracks.
