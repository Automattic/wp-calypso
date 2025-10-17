import page, { type Callback } from '@automattic/calypso-router';
import { createElement } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import Main from './main';

const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

export const redirectToAdsEarnings: Callback = ( context ) => {
	page.redirect( earnPath + '/ads-earnings/' + context.params.site_id );
};

export const redirectToAdsSettings: Callback = ( context ) => {
	page.redirect( earnPath + '/ads-settings/' + context.params.site_id );
};

export const redirectToSettings: Callback = ( context ) => {
	page.redirect( earnPath + '/payments/' + context.params.site_id );
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
