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

export default {
	login( context, next ) {
		const { lang, path, params: { flow, twoFactorAuthType }, query } = context;

		context.primary = (
			<WPLogin
				locale={ lang }
				path={ path }
				twoFactorAuthType={ twoFactorAuthType }
				socialConnect={ flow === 'social-connect' }
				privateSite={ flow === 'private-site' }
				clientId={ query.client_id } />
		);

		next();
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
