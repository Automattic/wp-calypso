/** @format */

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
	redirect: function( context ) {
		page.redirect( '/earn/ads-earnings/' + context.params.site_id );
		return;
	},
	redirectToAdsSettings: function( context ) {
		page.redirect( '/earn/ads-settings/' + context.params.site_id );
		return;
	},
	layout: function( context, next ) {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = React.createElement( Main, {
			section: context.params.section,
			path: context.path,
		} );
		next();
	},
};
