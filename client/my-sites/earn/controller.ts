import page, { type Callback } from '@automattic/calypso-router';
import { createElement } from 'react';
import Main from './main';

export const redirectToAdsEarnings: Callback = ( context ) => {
	page.redirect( '/earn/ads-earnings/' + context.params.site_id );
};

export const redirectToAdsSettings: Callback = ( context ) => {
	page.redirect( '/earn/ads-settings/' + context.params.site_id );
};

export const layout: Callback = ( context, next ) => {
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
};
