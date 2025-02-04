import { isEnabled } from '@automattic/calypso-config';
import {
	isMonthly,
	isWooExpressPlan,
	isWpComProPlan,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
	isStarterPlan,
	is100YearPlan,
	Feature,
	applyTestFiltersToPlansList,
	FEATURE_CUSTOM_DOMAIN,
	getFeatureByKey,
	getPlan,
} from '@automattic/calypso-products';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export default function getPlanFeatures(
	plan: ResponseCartProduct | undefined,
	translate: ReturnType< typeof useTranslate >,
	hasDomainsInCart: boolean,
	hasRenewalInCart: boolean,
	nextDomainIsFree: boolean,
	showPricingGridFeatures?: boolean
): string[] {
	const showFreeDomainFeature = ! hasDomainsInCart && ! hasRenewalInCart && nextDomainIsFree;
	const productSlug = plan?.product_slug;

	if ( ! productSlug ) {
		return [];
	}

	const isMonthlyPlan = isMonthly( productSlug );

	if ( showPricingGridFeatures ) {
		const plan = getPlan( productSlug );
		if ( ! plan ) {
			return [];
		}

		const planObject = applyTestFiltersToPlansList( productSlug, undefined );

		if ( ! planObject ) {
			return [];
		}

		const features: Feature[] = planObject?.getCheckoutFeatures?.() || [];
		const annualPlanOnlyFeatures = planObject?.getAnnualPlansOnlyFeatures?.() || [];

		const featureList = features
			// Exclude annual plan only features if the current plan is a monthly plan
			.filter( ( feature ) => ! isMonthlyPlan || ! annualPlanOnlyFeatures.includes( feature ) )
			// Show the free domain feature if `showFreeDomainFeature` is true
			.filter( ( feature ) => feature !== FEATURE_CUSTOM_DOMAIN || showFreeDomainFeature )
			.map( ( feature ) => String( getFeatureByKey( feature )?.getTitle() ) );

		// If the new feature list is available, return it.
		// Else fallback to the previous list of features.
		if ( featureList.length ) {
			return featureList;
		}
	}

	/**
	 * For WPCOM plans, the feature list for new purchases is returned by the above function.
	 * The following is used to return the feature list for manual renewals.
	 */
	const fastSupport = String( translate( 'Fast support' ) );
	const prioritySupport = String( translate( 'Priority support 24/7' ) );
	const freeOneYearDomain = showFreeDomainFeature
		? String( translate( 'Free domain for one year' ) )
		: undefined;
	const googleAnalytics = String( translate( 'Track your stats with Google Analytics' ) );

	if ( isWpComPersonalPlan( productSlug ) ) {
		return [
			! isMonthlyPlan && freeOneYearDomain,
			fastSupport,
			String( translate( 'Best-in-class hosting' ) ),
			String( translate( 'Dozens of Free Themes' ) ),
			String( translate( 'Ad-free experience' ) ),
		].filter( isValueTruthy );
	}

	if ( isStarterPlan( productSlug ) ) {
		return [
			freeOneYearDomain,
			fastSupport,
			String( translate( 'Best-in-class hosting' ) ),
			String( translate( 'Dozens of Free Themes' ) ),
			String( translate( 'Track your stats with Google Analytics' ) ),
		].filter( isValueTruthy );
	}

	if ( isWpComPremiumPlan( productSlug ) ) {
		return [
			! isMonthlyPlan && freeOneYearDomain,
			isMonthlyPlan && fastSupport,
			! isMonthlyPlan && prioritySupport,
			isEnabled( 'themes/premium' )
				? String( translate( 'Unlimited access to our library of Premium Themes' ) )
				: null,
			isEnabled( 'earn/pay-with-paypal' )
				? String( translate( 'Subscriber-only content and Pay with PayPal buttons' ) )
				: String( translate( 'Subscriber-only content and payment buttons' ) ),
			googleAnalytics,
		].filter( isValueTruthy );
	}

	if ( isWpComBusinessPlan( productSlug ) || isWpComProPlan( productSlug ) ) {
		return [
			! isMonthlyPlan && freeOneYearDomain,
			isMonthlyPlan && fastSupport,
			! isMonthlyPlan && prioritySupport,
			String( translate( 'Install custom plugins and themes' ) ),
			String( translate( 'Drive traffic to your site with our advanced SEO tools' ) ),
			String( translate( 'Track your stats with Google Analytics' ) ),
			String( translate( 'Real-time backups and activity logs' ) ),
		].filter( isValueTruthy );
	}

	if ( isWpComEcommercePlan( productSlug ) || isWooExpressPlan( productSlug ) ) {
		return [
			! isMonthlyPlan && freeOneYearDomain,
			isMonthlyPlan && fastSupport,
			! isMonthlyPlan && prioritySupport,
			String( translate( 'Install custom plugins and themes' ) ),
			String( translate( 'Accept payments in 60+ countries' ) ),
			String( translate( 'Integrations with top shipping carriers' ) ),
			String( translate( 'Unlimited products or services for your online store' ) ),
			String( translate( 'eCommerce marketing tools for emails and social networks' ) ),
		].filter( isValueTruthy );
	}

	if ( is100YearPlan( productSlug ) ) {
		return [
			String( translate( 'Century-long domain registration' ) ),
			String( translate( 'Enhanced ownership protocols' ) ),
			String( translate( 'Top-tier managed WordPress hosting' ) ),
			String( translate( '24/7 Premier Support' ) ),
			String( translate( 'Peace of mind' ) ),
		];
	}

	return [];
}
