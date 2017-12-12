/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { parse as parseUrl } from 'url';
import page from 'page';
import qs from 'qs';
import { map } from 'lodash';

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
	const { path, params: { flow, twoFactorAuthType, socialService } } = context;

	context.cacheQueryKeys = [ 'client_id' ];

	context.primary = (
		<WPLogin
			path={ path }
			twoFactorAuthType={ twoFactorAuthType }
			socialService={ socialService }
			socialServiceResponse={ context.hash }
			socialConnect={ flow === 'social-connect' }
			privateSite={ flow === 'private-site' }
		/>
	);
};

export default {
	// Defining this here so it can be used by both ./index.node.js and ./index.web.js
	// We cannot export it from either of those (to import it from the other) because of
	// the way that `server/bundler/loader` expects only a default export and nothing else.
	lang: `:lang(${ map( config( 'languages' ), 'langSlug' ).join( '|' ) })?`,

	login( context, next ) {
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
	},

	magicLogin( context, next ) {
		context.primary = <MagicLogin />;

		next();
	},

	magicLoginUse( context, next ) {
		/**
		 * Pull the query arguments out of the URL & into the state.
		 * It unclutters the address bar & will keep tokens out of tracking pixels.
		 */
		if ( context.querystring ) {
			page.replace( '/log-in/link/use', context.query );
			return;
		}

		const previousQuery = context.state || {};

		const { client_id, email, token } = previousQuery;

		context.primary = (
			<HandleEmailedLinkForm clientId={ client_id } emailAddress={ email } token={ token } />
		);

		next();
	},

	redirectDefaultLocale( context, next ) {
		// only redirect `/log-in/en` to `/log-in`
		if ( context.pathname !== '/log-in/en' ) {
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

		context.redirect( '/log-in' );
	},
};
