import page from '@automattic/calypso-router';
import { createElement, FC } from 'react';
import Main from './main';
import { Query } from './types';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export default {
	redirectToAdsEarnings: function ( context: PageJSContext ) {
		page.redirect( '/earn/ads-earnings/' + context.params.site_id );
	},
	redirectToAdsSettings: function ( context: PageJSContext ) {
		page.redirect( '/earn/ads-settings/' + context.params.site_id );
	},
	layout: function ( context: PageJSContext, next: () => void ) {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = createElement(
			Main as FC< { section: string; path: string; query: Query } >,
			{
				section: context.params.section,
				path: context.path,
				query: context.query,
			}
		);
		next();
	},
};
