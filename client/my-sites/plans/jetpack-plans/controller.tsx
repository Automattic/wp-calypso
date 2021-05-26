/**
 * External dependencies
 */
import React from 'react';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import getParamsFromContext from './get-params-from-context';
import { getPlanRecommendationFromContext } from './plan-upgrade/utils';
import SelectorPage from './selector';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { getHighlightedProduct, stringToDuration } from './utils';

/**
 * Type dependencies
 */
import type { Duration, QueryArgs } from './types';

export const productSelect = ( rootUrl: string ): PageJS.Callback => ( context, next ) => {
	// Get the selected site's current plan term, and set it as default duration
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const urlQueryArgs: QueryArgs = context.query;
	const { site: siteParam, duration: durationParam } = getParamsFromContext( context );
	const duration = siteId && ( getCurrentPlanTerm( state, siteId ) as Duration );
	const planRecommendation = isEnabled( 'jetpack/redirect-legacy-plans' )
		? getPlanRecommendationFromContext( context )
		: undefined;
	const highlightedProducts = getHighlightedProduct( urlQueryArgs.plan ) || undefined;

	context.primary = (
		<SelectorPage
			defaultDuration={ stringToDuration( durationParam ) || duration || TERM_ANNUALLY }
			rootUrl={ rootUrl }
			siteSlug={ siteParam || context.query.site }
			urlQueryArgs={ urlQueryArgs }
			highlightedProducts={ highlightedProducts }
			header={ context.header }
			footer={ context.footer }
			planRecommendation={ planRecommendation }
		/>
	);

	next();
};
