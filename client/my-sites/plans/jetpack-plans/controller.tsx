import { TERM_MONTHLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import JetpackBoostWelcomePage from 'calypso/components/jetpack/jetpack-boost-welcome';
import JetpackFreeWelcomePage from 'calypso/components/jetpack/jetpack-free-welcome';
import JetpackSocialWelcomePage from 'calypso/components/jetpack/jetpack-social-welcome';
import { JPC_PATH_PLANS } from 'calypso/jetpack-connect/constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSlugInTerm } from './convert-slug-terms';
import getParamsFromContext from './get-params-from-context';
import { getPlanRecommendationFromContext } from './plan-upgrade/utils';
import SelectorPage from './selector';
import { StoragePricing } from './storage-pricing';
import { StoragePricingHeader } from './storage-pricing-header';
import JetpackUpsellPage from './upsell';
import type { Duration, QueryArgs } from './types';
import type { Callback } from '@automattic/calypso-router';

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

export const productSelect =
	( rootUrl: string ): Callback =>
	( context, next ) => {
		// If the URL contains a duration, use it to determine the default duration. Ignore selected site's duration.
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const urlQueryArgs: QueryArgs = context.query;
		const { lang } = context.params;
		const { site: siteParam, duration: durationParam } = getParamsFromContext( context );
		const planRecommendation = getPlanRecommendationFromContext( context );
		const highlightedProducts = getHighlightedProduct( urlQueryArgs.plan ) || undefined;
		const enableUserLicensesDialog = !! (
			siteId &&
			( isJetpackCloud() || context.path.startsWith( JPC_PATH_PLANS ) )
		);

		context.primary = (
			<SelectorPage
				defaultDuration={
					stringToDuration( durationParam ) ||
					stringToDuration( urlQueryArgs.duration ) ||
					TERM_ANNUALLY
				}
				rootUrl={ rootUrl }
				siteSlug={ siteParam || urlQueryArgs.site }
				urlQueryArgs={ urlQueryArgs }
				highlightedProducts={ highlightedProducts }
				nav={ context.nav }
				header={ context.header }
				footer={ context.footer }
				planRecommendation={ planRecommendation }
				enableUserLicensesDialog={ enableUserLicensesDialog }
				locale={ lang }
			/>
		);

		next();
	};

export const jetpackFreeWelcome: Callback = ( context, next ) => {
	context.primary = <JetpackFreeWelcomePage />;
	next();
};

export const jetpackBoostWelcome: Callback = ( context, next ) => {
	context.primary = <JetpackBoostWelcomePage />;
	next();
};

export const jetpackSocialWelcome: Callback = ( context, next ) => {
	context.primary = <JetpackSocialWelcomePage />;
	next();
};

export const jetpackStoragePricing: Callback = ( context, next ) => {
	const { site, duration } = getParamsFromContext( context );
	const urlQueryArgs: QueryArgs = context.query;
	const { lang } = context.params;
	context.header = <StoragePricingHeader />;
	context.primary = (
		<StoragePricing
			nav={ context.nav }
			header={ context.header }
			footer={ context.footer }
			defaultDuration={ stringToDuration( duration ) || duration || TERM_ANNUALLY }
			urlQueryArgs={ urlQueryArgs }
			siteSlug={ site || context.query.site }
			locale={ lang }
		/>
	);
	next();
};

export const jetpackProductUpsell =
	( rootUrl: string ): Callback =>
	( context, next ) => {
		const { site, product } = context.params;
		const urlQueryArgs = context.query;

		context.primary = (
			<JetpackUpsellPage
				rootUrl={ rootUrl }
				siteSlug={ site || urlQueryArgs.site }
				productSlug={ product }
				urlQueryArgs={ urlQueryArgs }
			/>
		);

		// Hide sidebar
		context.secondary = null;

		next();
	};
