/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { isEnabled } from '@automattic/calypso-config';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import {
	isMonthly,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
} from '@automattic/calypso-products';
import doesValueExist from './does-value-exist';

export default function getPlanFeatures(
	plan: ResponseCartProduct | undefined,
	translate: ReturnType< typeof useTranslate >,
	hasDomainsInCart: boolean,
	hasRenewalInCart: boolean,
	planHasDomainCredit: boolean
): string[] {
	const showFreeDomainFeature = ! hasDomainsInCart && ! hasRenewalInCart && planHasDomainCredit;
	const productSlug = plan?.product_slug;

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
		return [
			isMonthlyPlan ? annualPlanOnly( freeOneYearDomain ) : freeOneYearDomain,
			String( translate( 'Best-in-class hosting' ) ),
			String( translate( 'Dozens of Free Themes' ) ),
		].filter( doesValueExist );
	}

	if ( isWpComPremiumPlan( productSlug ) ) {
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

	if ( isWpComBusinessPlan( productSlug ) ) {
		return [
			isMonthlyPlan ? annualPlanOnly( freeOneYearDomain ) : freeOneYearDomain,
			isMonthlyPlan ? annualPlanOnly( liveChatSupport ) : liveChatSupport,
			String( translate( 'Install custom plugins and themes' ) ),
			String( translate( 'Drive traffic to your site with our advanced SEO tools' ) ),
			String( translate( 'Track your stats with Google Analytics' ) ),
			String( translate( 'Real-time backups and activity logs' ) ),
		].filter( doesValueExist );
	}

	if ( isWpComEcommercePlan( productSlug ) ) {
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

	return [];
}
