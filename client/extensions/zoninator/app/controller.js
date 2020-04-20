/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Settings from '../components/settings';

export const renderTab = ( component ) => ( context, next ) => {
	const zoneId = parseInt( context.params.zone, 10 ) || 0;
	context.primary = <Settings>{ React.createElement( component, { zoneId } ) }</Settings>;
	next();
};
