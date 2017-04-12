/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import WPLogin from './wp-login';

export default {
	login( context, next ) {
		context.primary = <WPLogin />;

		next();
	}
};
