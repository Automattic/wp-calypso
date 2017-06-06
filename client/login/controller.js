/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import WPLogin from './wp-login';
import MagicLogin from './magic-login';

export default {
	login( context, next ) {
		const { params } = context;

		context.primary = <WPLogin twoFactorAuthType={ params.twoFactorAuthType } />;

		next();
	},

	magicLogin( context, next ) {
		context.primary = <MagicLogin />;
		next();
	}
};
