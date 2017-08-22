/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import WPLogin from './wp-login';
import MagicLogin from './magic-login';
import HandleEmailedLinkForm from './magic-login/handle-emailed-link-form';
import { fetchOAuth2ClientData } from 'state/login/oauth2/actions';

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
		const { query: { client_id } } = context;

		if ( client_id ) {
			context.store.dispatch( fetchOAuth2ClientData( Number( client_id ) ) )
				.then( () => {
					enhanceContextWithLogin( context );
					next();
				} );
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
