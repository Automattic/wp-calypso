import { TERM_MONTHLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import JetpackFreeWelcomePage from 'calypso/components/jetpack/jetpack-free-welcome';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSlugInTerm } from './convert-slug-terms';
import getParamsFromContext from './get-params-from-context';
import { getPlanRecommendationFromContext } from './plan-upgrade/utils';
import SelectorPage from './selector';
import { StoragePricing } from './storage-pricing';
import { StoragePricingHeader } from './storage-pricing-header';
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
 * @returns {[string, string] | null} the monthly and yearly slug of a supported Jetpack product, in that order
 */
function getHighlightedProduct( productSlug?: string ): [ string, string ] | null {
	if ( ! productSlug ) {
		return null;
	}

	const yearlySlug = getSlugInTerm( productSlug, TERM_ANNUALLY );
	const monthlySlug = getSlugInTerm( productSlug, TERM_MONTHLY );

	// If both a yearly and monthly version don't exist,
	// either `productSlug` isn't a Jetpack slug or something is wrong,
	// so return null.
	if ( ! yearlySlug || ! monthlySlug ) {
		return null;
	}

	return [ monthlySlug, yearlySlug ];
}

export const productSelect = ( rootUrl: string ): PageJS.Callback => ( context, next ) => {
	// Get the selected site's current plan term, and set it as default duration
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const urlQueryArgs: QueryArgs = context.query;
	const { locale } = context.params;
	const { site: siteParam, duration: durationParam } = getParamsFromContext( context );
	const duration = siteId && ( getCurrentPlanTerm( state, siteId ) as Duration );
	const planRecommendation = getPlanRecommendationFromContext( context );
	const highlightedProducts = getHighlightedProduct( urlQueryArgs.plan ) || undefined;

	const enableUserLicensesDialog = !! (
		siteId &&
		( isJetpackCloud() || context.path.startsWith( '/jetpack/connect/plans' ) )
	);

	context.primary = (
		<SelectorPage
			defaultDuration={ stringToDuration( durationParam ) || duration || TERM_ANNUALLY }
			rootUrl={ rootUrl }
			siteSlug={ siteParam || context.query.site }
			urlQueryArgs={ urlQueryArgs }
			highlightedProducts={ highlightedProducts }
			nav={ context.nav }
			header={ context.header }
			footer={ context.footer }
			planRecommendation={ planRecommendation }
			enableUserLicensesDialog={ enableUserLicensesDialog }
			locale={ locale }
		/>
	);

	next();
};

export function jetpackFreeWelcome( context: PageJS.Context, next: () => void ): void {
	context.primary = <JetpackFreeWelcomePage />;
	next();
}

export const jetpackStoragePricing = ( context: PageJS.Context, next: () => void ) => {
	const { site, duration } = getParamsFromContext( context );
	const urlQueryArgs: QueryArgs = context.query;
	const { locale } = context.params;
	context.header = <StoragePricingHeader />;
	context.primary = (
		<StoragePricing
			nav={ context.nav }
			header={ context.header }
			footer={ context.footer }
			defaultDuration={ stringToDuration( duration ) || duration || TERM_ANNUALLY }
			urlQueryArgs={ urlQueryArgs }
			siteSlug={ site || context.query.site }
			locale={ locale }
		/>
	);
	next();
};
