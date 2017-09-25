/**
 * External dependencies
 */
import page from 'page';
import qs from 'qs';
import React from 'react';

/**
 * Internal dependencies
 */
import MagicLogin from './magic-login';
import HandleEmailedLinkForm from './magic-login/handle-emailed-link-form';
import WPLogin from './wp-login';
import { recordTracksEvent } from 'state/analytics/actions';
import { fetchOAuth2ClientData } from 'state/oauth2-clients/actions';
import { parse as parseUrl } from 'url';

const enhanceContextWithLogin = context => {
	const {
		lang,
		path,
		params: { flow, twoFactorAuthType },
	} = context;

	context.cacheQueryKeys = [ 'client_id' ];

	context.primary = (
		<WPLogin
			locale={ lang }
			path={ path }
			twoFactorAuthType={ twoFactorAuthType }
			socialConnect={ flow === 'social-connect' }
			privateSite={ flow === 'private-site' }
		/>
	);
};

export default {
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

				const error = new Error( 'The `redirect_to` query parameter is invalid with the given `client_id`.' );
				error.status = 401;
				return next( error );
			}

			context.store.dispatch( fetchOAuth2ClientData( Number( client_id ) ) )
				.then( () => {
					enhanceContextWithLogin( context );

					next();
				} ).catch( error => next( error ) );
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

		const {
			client_id,
			email,
			token,
			tt,
		} = previousQuery;

		context.primary = (
			<HandleEmailedLinkForm
				clientId={ client_id }
				emailAddress={ email }
				token={ token }
				tokenTime={ tt }
			/>
		);

		next();
	},
};
