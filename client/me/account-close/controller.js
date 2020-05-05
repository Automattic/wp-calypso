/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AccountSettingsCloseComponent from 'me/account-close/main';
import AccountSettingsClosedComponent from 'me/account-close/closed';
import { hideSidebar } from 'state/ui/actions';

const removeSidebar = ( context ) => context.store.dispatch( hideSidebar() );

export function accountClose( context, next ) {
	context.primary = React.createElement( AccountSettingsCloseComponent );
	next();
}

export function accountClosed( context, next ) {
	removeSidebar( context );
	context.primary = React.createElement( AccountSettingsClosedComponent );
	next();
}
