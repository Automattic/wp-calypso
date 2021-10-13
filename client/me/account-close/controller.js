import { createElement } from 'react';
import AccountSettingsClosedComponent from 'calypso/me/account-close/closed';
import AccountSettingsCloseComponent from 'calypso/me/account-close/main';

export function accountClose( context, next ) {
	context.primary = createElement( AccountSettingsCloseComponent );
	next();
}

export function accountClosed( context, next ) {
	context.primary = createElement( AccountSettingsClosedComponent );
	next();
}
