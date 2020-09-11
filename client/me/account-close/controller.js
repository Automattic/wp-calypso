/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AccountSettingsCloseComponent from 'me/account-close/main';
import AccountSettingsClosedComponent from 'me/account-close/closed';

export function accountClose( context, next ) {
	context.primary = React.createElement( AccountSettingsCloseComponent );
	next();
}

export function accountClosed( context, next ) {
	context.primary = React.createElement( AccountSettingsClosedComponent );
	next();
}
