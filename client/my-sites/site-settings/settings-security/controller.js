/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SecurityMain from 'my-sites/site-settings/settings-security/main';

export default {
	security( context, next ) {
		context.primary = <SecurityMain setting={ Object.keys( context.hash )[ 0 ] } />;
		next();
	},
};
