import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import { useSelector } from 'calypso/state';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import useOneDollarOfferTrack from '../../hooks/use-onedollar-offer-track';

const getTargetPlanAndTrackEvent = ( isEcommerceTrial: boolean, isWooExpressTrial: boolean ) => {
	if ( isEcommerceTrial ) {
		return isWooExpressTrial
			? [ PLAN_WOOEXPRESS_MEDIUM_MONTHLY, 'calypso_wooexpress_my_plan_cta' ]
			: [ PLAN_ECOMMERCE_MONTHLY, 'calypso_entrepreneur_my_plan_cta' ];
	}

	return [ PLAN_BUSINESS, 'calypso_migration_my_plan_cta' ];
};

const useGoToCheckoutWithPlan = () => {
	const selectedSite = useSelector( getSelectedSite );
	const purchase = useSelector( getSelectedPurchase );

	const currentPlanSlug = selectedSite?.plan?.product_slug ?? '';
	const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const isWooExpressTrial = purchase?.isWooExpressTrial;

	const [ targetPlan, trackEvent ] = getTargetPlanAndTrackEvent(
		isEcommerceTrial,
		!! isWooExpressTrial
	);

	useOneDollarOfferTrack( selectedSite?.ID, 'plans' );

	/**
	 * Redirects to the checkout page with Plan in cart.
	 * @param ctaPosition - The position of the CTA that triggered the redirect.
	 */
	const goToCheckoutWithPlan = ( ctaPosition: string ) => {
		recordTracksEvent( trackEvent, {
			cta_position: ctaPosition,
		} );

		const checkoutUrl = getTrialCheckoutUrl( {
			productSlug: targetPlan,
			siteSlug: selectedSite?.slug ?? '',
		} );

		page.redirect( checkoutUrl );
	};

	return goToCheckoutWithPlan;
};

export default useGoToCheckoutWithPlan;
