/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal Dependencies
 */
import CustomerHome from './main';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { canCurrentUserUseCustomerHome } from 'state/sites/selectors';

export default function( context, next ) {
	const siteId = getSelectedSiteId( context.store.getState() );
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <CustomerHome checklistMode={ get( context, 'query.d' ) } key={ siteId } />;

	next();
}

export function maybeRedirect( context, next ) {
	const state = context.store.getState();
	const slug = getSelectedSiteSlug( state );
	if ( ! canCurrentUserUseCustomerHome( state ) ) {
		page.redirect( `/stats/day/${ slug }` );
		return;
	}
	next();
}
