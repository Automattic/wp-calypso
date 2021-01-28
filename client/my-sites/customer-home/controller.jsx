/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import CustomerHome from './main';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { canCurrentUserUseCustomerHome } from 'calypso/state/sites/selectors';

export default async function ( context, next ) {
	const state = await context.store.getState();
	const siteId = await getSelectedSiteId( state );

	const isDev = context.query.dev === 'true';
	const forcedView = context.query.view;
	const noticeType = context.query.notice;

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = (
		<CustomerHome
			key={ siteId }
			isDev={ isDev }
			forcedView={ forcedView }
			noticeType={ noticeType }
		/>
	);

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
