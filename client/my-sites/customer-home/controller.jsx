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
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, canCurrentUserUseCustomerHome } from 'state/sites/selectors';

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

export function redirectToPrimarySiteOrReader( context ) {
	const state = context.store.getState();
	const primarySiteId = getPrimarySiteId( state );
	const primarySiteSlug = getSiteSlug( state, primarySiteId );
	let redirectPath = primarySiteSlug ? `/home/${ primarySiteSlug }` : `/read`;

	if ( context.querystring ) {
		redirectPath += `?${ context.querystring }`;
	}

	page.redirect( redirectPath );
}
