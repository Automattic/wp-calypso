/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SelectorPage from './selector';
import DetailsPage from './details';
import UpsellPage from './upsell';
import { stringToDuration } from './utils';
import getCurrentPlanTerm from 'state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'state/ui/selectors';
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';

export const productSelect = ( rootUrl: string ) => ( context: PageJS.Context, next: Function ) => {
	// Get the selected site's current plan term, and set it as default duration
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const duration =
		siteId && getCurrentPlanTerm( state, siteId ) === 'TERM_MONTHLY' ? TERM_MONTHLY : TERM_ANNUALLY;

	context.primary = (
		<SelectorPage
			defaultDuration={ duration }
			rootUrl={ rootUrl }
			header={ context.header }
			footer={ context.footer }
		/>
	);
	next();
};

export const productDetails = ( rootUrl: string ) => (
	context: PageJS.Context,
	next: Function
) => {
	const productType: string = context.params.product;
	const duration = stringToDuration( context.params.duration );
	context.primary = (
		<DetailsPage
			productSlug={ productType }
			duration={ duration }
			rootUrl={ rootUrl }
			header={ context.header }
			footer={ context.footer }
		/>
	);
	next();
};

export const productUpsell = ( rootUrl: string ) => ( context: PageJS.Context, next: Function ) => {
	const productSlug: string = context.params.product;
	const duration = stringToDuration( context.params.duration );
	context.primary = (
		<UpsellPage
			productSlug={ productSlug }
			duration={ duration }
			rootUrl={ rootUrl }
			header={ context.header }
			footer={ context.footer }
		/>
	);
	next();
};
