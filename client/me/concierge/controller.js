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
	context.primary = React.createElement( ConciergeMain, { siteSlug: context.params.siteSlug } );
	next();
};

export default {
	concierge,
};
