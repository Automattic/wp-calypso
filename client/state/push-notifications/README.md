Push Notifications
==========

A module for managing push notification state & communicating with the service worker.

## Selected selectors:
### `getStatus` (string):
 * `denied`: The user denied the push notification via the browser's UI. Further calls to the `activateSubscription` action will fail. The user must grant permission manually via the browser's UI. We cannot trigger that UI.
 * `subscribed`: The user has opted into push notifications via a call to `subscribe()`.
 * `enabling`: The user has clicked enable and we don't yet have a subscription.
 * `disabling`: The user has clicked disable and we are disabling our subscription.
 * `unsubscribed`: The user has either not yet given permissions, or has revoked them via a call to `unsubscribe()`
 * `unknown`: The browser may not support push notifications, or the state has not yet been determined

## Selected Action creators:
 * `toggleEnabled`: Turn push notifications on and off

#### How to use

```js
import React from 'react';
import { connect } from 'react-redux';

function mapStateToProps( state ) => {
	return {
		getStatus: getStatus( state ),
		isBlocked: isBlocked( state ),
		isEnabled: isEnabled( state ),
		isNoticeDismissed: isNoticeDismissed( state )
		// etc.
	};
}
const mapDispatchToProps = {
	dismissNotice,
	toggleEnabled
};

const YourReactClass = React.createClass( {
	toggleEnabled() {
		this.props.toggleEnabled();
	}
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( YourReactClass );

```
