/**
 * External dependencies
 */
import React from 'react';
import { parse as parseUrl } from 'url';
import qs from 'qs';

/**
 * Internal dependencies
 */
import WPLogin from './wp-login';
import MagicLogin from './magic-login';
import HandleEmailedLinkForm from './magic-login/handle-emailed-link-form';
import { fetchOAuth2ClientData } from 'state/oauth2-clients/actions';
import { recordTracksEvent } from 'state/analytics/actions';

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
				return next( new Error( 'The `redirect_to` query parameter is missing.' ) );
			}

			const parsedRedirectUrl = parseUrl( redirect_to );
			const redirectQueryString = qs.parse( parsedRedirectUrl.query );

			if ( client_id !== redirectQueryString.client_id ) {
				recordTracksEvent( 'calypso_login_phishing_attempt', context.query );

				return next( new Error( 'The `redirect_to` query parameter is invalid with the given `client_id`.' ) );
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
		const {
			client_id,
			email,
			token,
			tt,
		} = context.query;

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
