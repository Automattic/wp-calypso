/** @format */

/**
 * External dependencies
 */
import { parse as parseUrl } from 'url';
import { parse } from 'qs';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	lang,
	login,
	magicLogin,
	magicLoginUse,
	redirectJetpack,
	redirectDefaultLocale,
} from './controller';
import { makeLayout, redirectLoggedIn, setUpLocale } from 'controller';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';

function checkRedirectToIsValid( context, next ) {
	const { isServerSide, query: { client_id, redirect_to } } = context;

	if ( isServerSide ) {
		return next();
	}

	if ( ! redirect_to ) {
		const error = new Error( 'The `redirect_to` query parameter is missing.' );
		error.status = 401;
		return next( error );
	}

	if ( client_id ) {
		const parsedRedirectUrl = parseUrl( redirect_to );
		const redirectQueryString = parse( parsedRedirectUrl.query );

		if ( client_id !== redirectQueryString.client_id ) {
			recordTracksEvent( 'calypso_login_phishing_attempt', context.query );

			const error = new Error(
				'The `redirect_to` query parameter is invalid with the given `client_id`.'
			);
			error.status = 401;
			return next( error );
		}
	}

	return next();
}

export default router => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		router(
			`/log-in/link/use/${ lang }`,
			setUpLocale,
			redirectLoggedIn,
			magicLoginUse,
			makeLayout
		);

		router( `/log-in/link/${ lang }`, setUpLocale, redirectLoggedIn, magicLogin, makeLayout );
	}

	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			[
				`/log-in/:twoFactorAuthType(authenticator|backup|sms|push)/${ lang }`,
				`/log-in/:flow(social-connect|private-site)/${ lang }`,
				`/log-in/:socialService(google)/callback/${ lang }`,
				`/log-in/:isJetpack(jetpack)/${ lang }`,
				`/log-in/${ lang }`,
			],
			redirectJetpack,
			redirectDefaultLocale,
			setUpLocale,
			checkRedirectToIsValid,
			login,
			makeLayout
		);
	}
};
