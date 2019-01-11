/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import TrafficMain from 'my-sites/site-settings/settings-traffic/main';

export function traffic( context, next ) {
	context.primary = React.createElement( TrafficMain );
	next();
}
