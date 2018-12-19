/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PerformanceMain from 'my-sites/site-settings/settings-performance/main';

export default {
	performance( context, next ) {
		context.primary = React.createElement( PerformanceMain );
		next();
	},
};
