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
import { TERM_ANNUALLY } from 'lib/plans/constants';

/**
 * Type dependencies
 */
import type { Duration, QueryArgs } from './types';

export const productSelect = ( rootUrl: string ) => ( context: PageJS.Context, next: Function ) => {
	// Get the selected site's current plan term, and set it as default duration
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const duration: Duration =
		( siteId && ( getCurrentPlanTerm( state, siteId ) as Duration ) ) ||
		( TERM_ANNUALLY as Duration );
	const urlQueryArgs: QueryArgs = context.query;

	context.primary = (
		<SelectorPage
			defaultDuration={ duration }
			rootUrl={ rootUrl }
			siteSlug={ context.params.site || context.query.site }
			urlQueryArgs={ urlQueryArgs }
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
	const duration: Duration = stringToDuration( context.params.duration ) || TERM_ANNUALLY;
	const urlQueryArgs: QueryArgs = context.query;

	context.primary = (
		<DetailsPage
			productSlug={ productType }
			duration={ duration }
			rootUrl={ rootUrl }
			siteSlug={ context.params.site || context.query.site }
			urlQueryArgs={ urlQueryArgs }
			header={ context.header }
		/>
	);
	next();
};

export const productUpsell = ( rootUrl: string ) => ( context: PageJS.Context, next: Function ) => {
	const productSlug: string = context.params.product;
	const duration: Duration = stringToDuration( context.params.duration ) || TERM_ANNUALLY;
	const urlQueryArgs: QueryArgs = context.query;

	context.primary = (
		<UpsellPage
			productSlug={ productSlug }
			duration={ duration }
			rootUrl={ rootUrl }
			siteSlug={ context.params.site || context.query.site }
			urlQueryArgs={ urlQueryArgs }
			header={ context.header }
		/>
	);
	next();
};
