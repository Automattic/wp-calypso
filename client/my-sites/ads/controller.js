/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Ads from 'my-sites/ads/main';

export default {
	redirect: function( context ) {
		page.redirect( '/ads/settings/' + context.params.site_id );
		return;
	},

	layout: function( context, next ) {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = React.createElement( Ads, {
			section: context.params.section,
			path: context.path,
		} );
		next();
	},
};
