/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PerformanceMain from './main';

export default {
	performance( context, next ) {
		context.primary = React.createElement( PerformanceMain );
		next();
	},
};
