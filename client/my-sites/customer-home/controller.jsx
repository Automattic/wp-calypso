/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal Dependencies
 */
import { abtest } from 'lib/abtest';
import CustomerHome from './main';
import { getSelectedSiteSlug } from 'state/ui/selectors';

export default function( context, next ) {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <CustomerHome checklistMode={ get( context, 'query.d' ) } />;

	next();
}

export function maybeRedirect( context, next ) {
	const slug = getSelectedSiteSlug( context.store.getState() );
	if ( 'hide' === abtest( 'customerHomePage' ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}
	next();
}
