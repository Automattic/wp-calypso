/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SiteSettingsPerformance from './main';

export function performance( context, next ) {
	context.primary = React.createElement( SiteSettingsPerformance );
	next();
}
