/**
 * External dependencies
 */
import React from 'react';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { getPlanRecommendationFromContext } from './plan-upgrade/utils';
import SelectorPage from './selector';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { getHighlightedProduct } from './utils';

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
	const planRecommendation = isEnabled( 'jetpack/redirect-legacy-plans' )
		? getPlanRecommendationFromContext( context )
		: undefined;

	const highlightedProducts = getHighlightedProduct( urlQueryArgs.plan ) || undefined;

	context.primary = (
		<SelectorPage
			defaultDuration={ duration }
			rootUrl={ rootUrl }
			siteSlug={ context.params.site || context.query.site }
			urlQueryArgs={ urlQueryArgs }
			highlightedProducts={ highlightedProducts }
			header={ context.header }
			footer={ context.footer }
			planRecommendation={ planRecommendation }
		/>
	);

	next();
};
