/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SiteSettingsPerformance from './main';

export default {
	performance( context, next ) {
		context.primary = React.createElement( SiteSettingsPerformance );
		next();
	},
};
