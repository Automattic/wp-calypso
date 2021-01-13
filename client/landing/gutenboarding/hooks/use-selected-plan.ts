/**
 * External dependencies
 */
import { Site } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { PLANS_STORE } from '../stores/plans';
import { WPCOM_FEATURES_STORE } from '../stores/wpcom-features';
import { usePlanRouteParam } from '../path';
import { usePlansBillingPeriod } from './use-plans-billing-period';

import type { Plan } from '../stores/plans';

/**
 * A React hook that returns the WordPress.com plan from path.
 *
 * Exception: Free plan is not returned while features are selected
 *
 * @returns { Plan } An object describing a WordPress.com plan
 */
export function usePlanFromPath(): Plan | undefined {
	const planPath = usePlanRouteParam();

	const [ isPlanFree, planFromPath, selectedFeatures ] = useSelect( ( select ) => [
		select( PLANS_STORE ).isPlanFree,
		select( PLANS_STORE ).getPlanByPath( planPath ),
		select( ONBOARD_STORE ).getSelectedFeatures(),
	] );

	// don't return Free plan if any feature is currently selected
	if ( isPlanFree( planFromPath?.storeSlug ) && selectedFeatures.length ) {
		return;
	}

	return planFromPath;
}

export function useSelectedPlan(): Plan {
	const billingPeriod = usePlansBillingPeriod();
	const locale = useLocale();
	// Pre-load the plans details to ensure the plans are fetched early from the API endpoint.
	useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans( locale, billingPeriod ) );

	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );
	const selectedPlan = useSelect( ( select ) => select( ONBOARD_STORE ).getPlan() );

	const recommendedPlanSlug = useSelect( ( select ) =>
		select( WPCOM_FEATURES_STORE ).getRecommendedPlanSlug( selectedFeatures, billingPeriod )
	);

	const recommendedPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanBySlug( recommendedPlanSlug )
	);

	const planFromPath = usePlanFromPath();

	/**
	 * Plan is decided in this order
	 * 1. selected from PlansGrid (by dispatching setPlan)
	 * 2. having the plan slug in the URL
	 * 3. selecting paid features
	 */
	return selectedPlan || planFromPath || recommendedPlan;
}

export function useNewSiteVisibility(): Site.Visibility {
	const currentSlug = useSelectedPlan()?.storeSlug;
	const isEcommerce = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanEcommerce( currentSlug )
	);

	if ( isEcommerce ) {
		return Site.Visibility.PublicIndexed;
	}

	return Site.Visibility.PublicNotIndexed;
}

export function useShouldRedirectToEditorAfterCheckout(): boolean {
	// The ecommerce plan follows another flow, so we shouldn't interrupt
	// it by trying to redirect to the editor.
	const currentSlug = useSelectedPlan()?.storeSlug;
	return ! useSelect( ( select ) => select( PLANS_STORE ).isPlanEcommerce( currentSlug ) );
}
