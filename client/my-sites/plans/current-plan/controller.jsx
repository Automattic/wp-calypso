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

	// On plans grid page we might've scrolled down.
	// Ensure we're scrolled to top when "thank you" modal is shown.
	if ( requestThankYou ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <CurrentPlan path={ context.path } requestThankYou={ requestThankYou } />;

	next();
}
