/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Purchases from 'my-sites/purchases/main.tsx';

export const purchases = ( context, next ) => {
	context.primary = <Purchases />;
	next();
};

export function redirectToPurchases( context ) {
	const siteDomain = context.params.site;

	if ( siteDomain ) {
		return page.redirect( `/purchases/subscriptions/${ siteDomain }` );
	}

	return page.redirect( '/purchases' );
}
