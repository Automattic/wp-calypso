/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ConciergeMain from './main';

const concierge = ( context, next ) => {
	context.primary = React.createElement( ConciergeMain, {} );
	next();
};

export default {
	concierge,
};
