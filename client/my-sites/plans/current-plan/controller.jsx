/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import { renderPage } from 'lib/react-helpers';
import CurrentPlan from './';
import { isFreePlan } from 'lib/products-values';
import { getSelectedSite } from 'state/ui/selectors';

export default {
	currentPlan( context ) {
		const state = context.store.getState();

		const selectedSite = getSelectedSite( state );

		if ( isFreePlan( selectedSite.plan ) ) {
			page.redirect( `/plans/${ selectedSite.slug }` );

			return null;
		}

		renderPage(
			<CurrentPlan context={ context } />,
			context
		);
	}
};
