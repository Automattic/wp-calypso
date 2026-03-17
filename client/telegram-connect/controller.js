import page from '@automattic/calypso-router';
import { createElement } from 'react';
import { login } from 'calypso/lib/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import TelegramConnectPage from './main';

export function telegramConnect( context, next ) {
	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		page.replace( login( { redirectTo: window.location.href } ) );
		return;
	}

	context.primary = createElement( TelegramConnectPage, {
		telegramId: context.query.telegram_id,
		token: context.query.token,
		ts: context.query.ts,
	} );
	next();
}
