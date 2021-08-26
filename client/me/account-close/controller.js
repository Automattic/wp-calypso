import React from 'react';
import AccountSettingsClosedComponent from 'calypso/me/account-close/closed';
import AccountSettingsCloseComponent from 'calypso/me/account-close/main';

export function accountClose( context, next ) {
	context.primary = React.createElement( AccountSettingsCloseComponent );
	next();
}

export function accountClosed( context, next ) {
	context.primary = React.createElement( AccountSettingsClosedComponent );
	next();
}
