/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import MainComponent from './main';

export default {
	unsubscribe( context, next ) {
		const { email, category, hmac, ...rest } = context.query;
		context.primary = React.createElement( MainComponent, {
			email,
			category,
			hmac,
			context: rest,
		} );
		next();
	},
};
