PushNotifications
==========

This modules provides an abstracted way to deal with registering a push notification subscription via the service worker.

This module exposes the property `state` which is one of:
 * `unknown`: The browser may not support push notifications, or the state has not yet been determined
 * `subscribed`: The user has opted into push notifications via a call to `subscribe()`.
 * `unsubscribed`: The user has either not yet given permissions, or has revoked them via a call to `unsubscribe()`
 * `denied`: The user denied the push notification via the browser's UI. Futher calls to `subscribe()` will fail. The user must grant permission manually via the browser's UI. We cannot trigger that UI.

It also exposes two methods:
 * `subscribe( [callback] )`: This method triggers the browser's UI for subscribing to push notifications (if necessary) and takes an optional callback
 * `unsubscribe( [callback] )`: This method unsubscribes the user from push notifications. There is no native browser UI. Subsequent calls to `subscribe()` will succeed without user intervention so long as the user hasn't manually updated their permissions.

#### How to use

```js

var pushNotifications = require( 'lib/push-notifications' );

/* Inside your component: */
	componentWillMount: function() {
		pushNotifications.on( 'change', this.handleChange );
	},

	componentWillUnmount: function() {
		pushNotifications.off( 'change', this.handleChange );
	},

	handleChange: function() {
		// Alter your UI based on the available states of 'unknown', 'subscribed', 'unsubscribed', or 'denied'
		var registrationState = pushNotifications.state;
	},

	subscribeClick: function() {
		pushNotifications.subscribe( function( state ) {
			// Callback is optional. You can use it to update your state variable so that you know your UI affected the subscription
		} );
	},

	unsubscribeClick: function() {
		pushNotifications.unsubscribe();
	}

```