import page from 'page';
import { createElement } from 'react';
import Main from './main';

export default {
	redirectToAdsEarnings: function ( context ) {
		page.redirect( '/earn/ads-earnings/' + context.params.site_id );
	},
	redirectToAdsSettings: function ( context ) {
		page.redirect( '/earn/ads-settings/' + context.params.site_id );
	},
	layout: function ( context, next ) {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = createElement( Main, {
			section: context.params.section,
			path: context.path,
			query: context.query,
		} );
		next();
	},
};
