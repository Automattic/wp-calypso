/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import { isMonthly } from 'calypso/lib/plans/constants';
import {
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
} from 'calypso/lib/plans';
import type { WPCOMCartItem } from '../types/checkout-cart';
import doesValueExist from './does-value-exist';

export default function getPlanFeatures(
	plan: WPCOMCartItem | undefined,
	translate: ReturnType< typeof useTranslate >,
	hasDomainsInCart: boolean,
	hasRenewalInCart: boolean,
	isMonthlyPricingTest: boolean,
	planHasDomainCredit: boolean
): string[] {
	const showFreeDomainFeature = ! hasDomainsInCart && ! hasRenewalInCart && planHasDomainCredit;
	const productSlug = plan?.wpcom_meta?.product_slug;

	if ( ! productSlug ) {
		return [];
	}

	const isMonthlyPlan = isMonthly( productSlug );
	const liveChatSupport = String( translate( 'Live chat support' ) );
	const freeOneYearDomain = showFreeDomainFeature
		? String( translate( 'Free domain for one year' ) )
		: undefined;
	const googleAnalytics = String( translate( 'Track your stats with Google Analytics' ) );
	const annualPlanOnly = ( feature: string | undefined ): string | null => {
		if ( ! feature ) {
			return null;
		}

		const label = translate( '(annual plans only)', {
			comment: 'Label attached to a feature',
		} );

		return `~~${ feature } ${ label }`;
	};

	if ( isWpComPersonalPlan( productSlug ) ) {
		if ( isMonthlyPricingTest ) {
			return [
				isMonthlyPlan ? annualPlanOnly( freeOneYearDomain ) : freeOneYearDomain,
				String( translate( 'Email support' ) ),
				String( translate( 'Dozens of Free Themes' ) ),
			].filter( doesValueExist );
		}

		return [
			freeOneYearDomain,
			String( translate( 'Remove WordPress.com ads' ) ),
			String( translate( 'Limit your content to paying subscribers.' ) ),
		].filter( doesValueExist );
	}

	if ( isWpComPremiumPlan( productSlug ) ) {
		if ( isMonthlyPricingTest ) {
			return [
				isMonthlyPlan ? annualPlanOnly( freeOneYearDomain ) : freeOneYearDomain,
				isMonthlyPlan ? annualPlanOnly( liveChatSupport ) : liveChatSupport,
				String( translate( 'Unlimited access to our library of Premium Themes' ) ),
				isEnabled( 'earn/pay-with-paypal' )
					? String( translate( 'Subscriber-only content and Pay with PayPal buttons' ) )
					: String( translate( 'Subscriber-only content and payment buttons' ) ),
				googleAnalytics,
			].filter( doesValueExist );
		}

		return [
			freeOneYearDomain,
			String( translate( 'Unlimited access to our library of Premium Themes' ) ),
			isEnabled( 'earn/pay-with-paypal' )
				? String( translate( 'Subscriber-only content and Pay with PayPal buttons' ) )
				: String( translate( 'Subscriber-only content and payment buttons' ) ),
			googleAnalytics,
		].filter( doesValueExist );
	}

	if ( isWpComBusinessPlan( productSlug ) ) {
		if ( isMonthlyPricingTest ) {
			return [
				isMonthlyPlan ? annualPlanOnly( freeOneYearDomain ) : freeOneYearDomain,
				isMonthlyPlan ? annualPlanOnly( liveChatSupport ) : liveChatSupport,
				String( translate( 'Install custom plugins and themes' ) ),
				String( translate( 'Drive traffic to your site with our advanced SEO tools' ) ),
				String( translate( 'Track your stats with Google Analytics' ) ),
				String( translate( 'Real-time backups and activity logs' ) ),
			].filter( doesValueExist );
		}

		return [
			freeOneYearDomain,
			String( translate( 'Install custom plugins and themes' ) ),
			String( translate( 'Drive traffic to your site with our advanced SEO tools' ) ),
			String( translate( 'Track your stats with Google Analytics' ) ),
			String( translate( 'Real-time backups and activity logs' ) ),
		].filter( doesValueExist );
	}

	if ( isWpComEcommercePlan( productSlug ) ) {
		if ( isMonthlyPricingTest ) {
			return [
				isMonthlyPlan ? annualPlanOnly( freeOneYearDomain ) : freeOneYearDomain,
				isMonthlyPlan ? annualPlanOnly( liveChatSupport ) : liveChatSupport,
				String( translate( 'Install custom plugins and themes' ) ),
				String( translate( 'Accept payments in 60+ countries' ) ),
				String( translate( 'Integrations with top shipping carriers' ) ),
				String( translate( 'Unlimited products or services for your online store' ) ),
				String( translate( 'eCommerce marketing tools for emails and social networks' ) ),
			].filter( doesValueExist );
		}

		return [
			freeOneYearDomain,
			String( translate( 'Install custom plugins and themes' ) ),
			String( translate( 'Accept payments in 60+ countries' ) ),
			String( translate( 'Integrations with top shipping carriers' ) ),
			String( translate( 'Unlimited products or services for your online store' ) ),
			String( translate( 'eCommerce marketing tools for emails and social networks' ) ),
		].filter( doesValueExist );
	}

	return [];
}
