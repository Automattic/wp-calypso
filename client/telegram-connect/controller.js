import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { createElement } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { login } from 'calypso/lib/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import TelegramConnectPage from './main';

export const LEGACY_TELEGRAM_CONNECT_PATH = '/telegram-connect';
export const TELEGRAM_CONNECT_PATH = '/me/get-apps/telegram-connect';

export function redirectLegacyTelegramConnect( context ) {
	const queryString = context.path.includes( '?' )
		? context.path.slice( context.path.indexOf( '?' ) )
		: '';

	page.redirect( `${ TELEGRAM_CONNECT_PATH }${ queryString }` );
}

export function telegramConnect( context, next ) {
	if ( ! config.isEnabled( 'dolly/telegram' ) ) {
		context.primary = createElement( EmptyContent, {
			title: 'Page not found.',
			line: "Sorry, the page you were looking for doesn't exist or has been moved.",
		} );
		next();
		return;
	}

	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		page.replace( login( { redirectTo: window.location.href } ) );
		return;
	}

	context.primary = createElement( TelegramConnectPage, {
		telegramId: context.query.telegram_id,
		token: context.query.token,
		ts: context.query.ts,
		bot: context.query.bot,
	} );
	next();
}
