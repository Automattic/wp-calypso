/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import CurrentPlan from './';
import { isFreePlan } from 'lib/products-values';
import { getSelectedSite } from 'state/ui/selectors';

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

	context.primary = (
		<CurrentPlan
			path={ context.path }
			requestThankYou={ context.query.hasOwnProperty( 'thank-you' ) }
		/>
	);
	next();
}
