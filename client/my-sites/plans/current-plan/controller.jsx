/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import CurrentPlan from './';
import { getSelectedSite } from 'state/ui/selectors';
import { isFreePlan } from 'lib/products-values';
import { setSection } from 'state/ui/actions';

export function currentPlan( context, next ) {
	const state = context.store.getState();

	const selectedSite = getSelectedSite( state );

	if ( ! selectedSite ) {
		page.redirect( '/plans/' );

		return null;
	}

	if ( isFreePlan( selectedSite.plan ) ) {
		page.redirect( `/plans/${ selectedSite.slug }` );

		return null;
	}

	const requestThankYou = context.query.hasOwnProperty( 'thank-you' );

	context.primary = <CurrentPlan path={ context.path } requestThankYou={ requestThankYou } />;

	if ( requestThankYou ) {
		context.store.dispatch( setSection( null, { hasSidebar: false } ) );
		context.secondary = null;
	}

	next();
}
