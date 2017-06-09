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
		context.primary = <WPLogin twoFactorAuthType={ context.params.twoFactorAuthType } />;
		next();
	},

	magicLogin( context, next ) {
		context.primary = <MagicLogin />;
		next();
	}
};
