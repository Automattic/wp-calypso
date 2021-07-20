/**
 * External dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import { TERM_MONTHLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import React from 'react';

/**
 * Internal dependencies
 */
import getParamsFromContext from './get-params-from-context';
import { getPlanRecommendationFromContext } from './plan-upgrade/utils';
import SelectorPage from './selector';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getMonthlySlugFromYearly, getYearlySlugFromMonthly } from './convert-slug-terms';
import JetpackFreeWelcomePage from 'calypso/components/jetpack/jetpack-free-welcome';

/**
 * Type dependencies
 */
import type { Duration, QueryArgs } from './types';

function stringToDuration( duration?: string ): Duration | undefined {
	if ( duration === undefined ) {
		return undefined;
	}
	if ( duration === 'monthly' ) {
		return TERM_MONTHLY;
	}
	return TERM_ANNUALLY;
}

/**
 * Return the slug of a highlighted product if the given slug is Jetpack product
 * slug, otherwise, return null.
 *
 * @param {string} productSlug the slug of a Jetpack product
 *
 * @returns {[string, string] | null} the monthly and yearly slug of a supported Jetpack product
 */
function getHighlightedProduct( productSlug?: string ): [ string, string ] | null {
	if ( ! productSlug ) {
		return null;
	}

	// If neither of these methods return a slug, it means that the `productSlug`
	// is not really a Jetpack product slug.
	const yearlySlug = getYearlySlugFromMonthly( productSlug );
	const monthlySlug = getMonthlySlugFromYearly( productSlug );

	if ( monthlySlug ) {
		return [ monthlySlug, productSlug ];
	} else if ( yearlySlug ) {
		return [ productSlug, yearlySlug ];
	}

	return null;
}

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

export function jetpackFreeWelcome( context: PageJS.Context, next: () => void ): void {
	context.primary = <JetpackFreeWelcomePage />;
	next();
}
