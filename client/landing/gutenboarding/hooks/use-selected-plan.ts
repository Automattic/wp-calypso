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
import { PLANS_STORE, Plan } from '../stores/plans';
import { WPCOM_FEATURES_STORE } from '../stores/wpcom-features';
import { usePlanRouteParam } from '../path';
import { isEnabled } from 'calypso/config';

/**
 * A React hook that returns the WordPress.com plan from path.
 *
 * Exception: Free plan is not returned while a paid domain is selected
 *
 * @returns { Plan } An object describing a WordPress.com plan
 */
export function usePlanFromPath(): Plan | undefined {
	const planPath = usePlanRouteParam();

	const [ isPlanFree, planFromPath, hasPaidDomain ] = useSelect( ( select ) => [
		select( PLANS_STORE ).isPlanFree,
		select( PLANS_STORE ).getPlanByPath( planPath ),
		select( ONBOARD_STORE ).hasPaidDomain(),
	] );

	// don't return Free plan if paid domain is currently selected
	if ( isPlanFree( planFromPath?.storeSlug ) && hasPaidDomain ) {
		return;
	}

	return planFromPath;
}

export function useSelectedPlan(): Plan {
	const locale = useLocale();
	// Pre-load the plans details to ensure the plans are fetched early from the API endpoint.
	useSelect( ( select ) => select( PLANS_STORE ).getPlansDetails( locale ) );

	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );
	const selectedPlan = useSelect( ( select ) => select( ONBOARD_STORE ).getPlan() );

	const recommendedPlanSlug = useSelect( ( select ) =>
		select( WPCOM_FEATURES_STORE ).getRecommendedPlanSlug( selectedFeatures )
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
	} else if ( isEnabled( 'coming-soon-v2' ) ) {
		return Site.Visibility.PublicNotIndexed;
	}

	return Site.Visibility.Private;
}

export function useShouldRedirectToEditorAfterCheckout() {
	// The ecommerce plan follows another flow, so we shouldn't interrupt
	// it by trying to redirect to the editor.
	const currentSlug = useSelectedPlan()?.storeSlug;
	return ! useSelect( ( select ) => select( PLANS_STORE ).isPlanEcommerce( currentSlug ) );
}
