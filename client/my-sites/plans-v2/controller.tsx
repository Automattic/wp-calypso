/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

import DetailsPage from './details';
import { getSelectorComponent } from './iterations';
import SelectorPage from './selector';
import UpsellPage from './upsell';
import { stringToDuration } from './utils';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TERM_ANNUALLY } from 'calypso/lib/plans/constants';

/**
 * Type dependencies
 */
import type { Duration, QueryArgs } from './types';

export const productSelect = ( rootUrl: string ): PageJS.Callback => ( context, next ) => {
	// Get the selected site's current plan term, and set it as default duration
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const duration: Duration =
		( siteId && ( getCurrentPlanTerm( state, siteId ) as Duration ) ) ||
		( TERM_ANNUALLY as Duration );
	const urlQueryArgs: QueryArgs = context.query;
	const SelectorComponent = getSelectorComponent() || SelectorPage;

	context.primary = (
		<SelectorComponent
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

export const productDetails = ( rootUrl: string ): PageJS.Callback => ( context, next ): void => {
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

export const productUpsell = ( rootUrl: string ): PageJS.Callback => ( context, next ) => {
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
