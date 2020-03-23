/**
 * External dependencies
 */

import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Main from './main';

export default {
	redirectToAds: function( context ) {
		page.redirect( '/earn/ads/' + context.params.site_id );
	},
	layout: function( context, next ) {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = React.createElement( Main, {
			section: context.params.section,
			path: context.path,
			query: context.query,
		} );
		next();
	},
};
