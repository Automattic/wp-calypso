/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { parse as parseUrl } from 'url';
import page from 'page';
import qs from 'qs';
import { includes, map } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import WPLogin from './wp-login';
import MagicLogin from './magic-login';
import HandleEmailedLinkForm from './magic-login/handle-emailed-link-form';
import { fetchOAuth2ClientData } from 'state/oauth2-clients/actions';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser, getCurrentUserLocale } from 'state/current-user/selectors';

const enhanceContextWithLogin = context => {
	const { path, params: { flow, isJetpack, socialService, twoFactorAuthType } } = context;

	context.cacheQueryKeys = [ 'client_id' ];

	context.primary = (
		<WPLogin
			isJetpack={ isJetpack === 'jetpack' }
			path={ path }
			twoFactorAuthType={ twoFactorAuthType }
			socialService={ socialService }
			socialServiceResponse={ context.hash }
			socialConnect={ flow === 'social-connect' }
			privateSite={ flow === 'private-site' }
		/>
	);
};

// Defining this here so it can be used by both ./index.node.js and ./index.web.js
// We cannot export it from either of those (to import it from the other) because of
// the way that `server/bundler/loader` expects only a default export and nothing else.
export const lang = `:lang(${ map( config( 'languages' ), 'langSlug' ).join( '|' ) })?`;

export function login( context, next ) {
	const { query: { client_id, redirect_to } } = context;

	if ( client_id ) {
		if ( ! redirect_to ) {
			const error = new Error( 'The `redirect_to` query parameter is missing.' );
			error.status = 401;
			return next( error );
		}

		const parsedRedirectUrl = parseUrl( redirect_to );
		const redirectQueryString = qs.parse( parsedRedirectUrl.query );

		if ( client_id !== redirectQueryString.client_id ) {
			recordTracksEvent( 'calypso_login_phishing_attempt', context.query );

			const error = new Error(
				'The `redirect_to` query parameter is invalid with the given `client_id`.'
			);
			error.status = 401;
			return next( error );
		}

		context.store
			.dispatch( fetchOAuth2ClientData( Number( client_id ) ) )
			.then( () => {
				enhanceContextWithLogin( context );

				next();
			} )
			.catch( error => next( error ) );
	} else {
		enhanceContextWithLogin( context );

		next();
	}
}

export function magicLogin( context, next ) {
	const { path } = context;

	context.primary = <MagicLogin path={ path } />;

	next();
}

export function magicLoginUse( context, next ) {
	/**
	 * Pull the query arguments out of the URL & into the state.
	 * It unclutters the address bar & will keep tokens out of tracking pixels.
	 */
	if ( context.querystring ) {
		page.replace( context.pathname, context.query );

		return;
	}

	const previousQuery = context.state || {};

	const { client_id, email, token } = previousQuery;

	context.primary = (
		<HandleEmailedLinkForm clientId={ client_id } emailAddress={ email } token={ token } />
	);

	next();
}

export function redirectDefaultLocale( context, next ) {
	// Only handle simple routes
	if ( context.pathname !== '/log-in/en' && context.pathname !== '/log-in/jetpack/en' ) {
		return next();
	}

	// Do not redirect if user bootrapping is disabled
	if (
		! getCurrentUser( context.store.getState() ) &&
		! config.isEnabled( 'wpcom-user-bootstrap' )
	) {
		return next();
	}

	// Do not redirect if user is logged in and the locale is different than english
	// so we force the page to display in english
	const currentUserLocale = getCurrentUserLocale( context.store.getState() );
	if ( currentUserLocale && currentUserLocale !== 'en' ) {
		return next();
	}

	if ( context.params.isJetpack === 'jetpack' ) {
		context.redirect( '/log-in/jetpack' );
	} else {
		context.redirect( '/log-in' );
	}
}

export function redirectJetpack( context, next ) {
	const { isJetpack } = context.params;
	const { redirect_to } = context.query;

	/**
	 * Send arrivals from the jetpack connect process (when site user email matches
	 * a wpcom account) to the jetpack branded login.
	 *
	 * A direct redirect to /log-in/jetpack is not currently done at jetpack.wordpress.com
	 * because the iOS app relies on seeing a request to /log-in$ to show its
	 * native credentials form.
	 */
	if ( isJetpack !== 'jetpack' && includes( redirect_to, 'jetpack/connect' ) ) {
		return context.redirect( context.path.replace( 'log-in', 'log-in/jetpack' ) );
	}
	next();
}
