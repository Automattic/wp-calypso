import {
	isMonthly,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';

export default function getPlanFeatures(
	productSlug: string | undefined,
	translate: ReturnType< typeof useTranslate >,
	withinFirstYear: boolean,
	hasDomain: boolean,
	domainSlug: string
): string[] {
	if ( ! productSlug ) {
		return [];
	}

	const isMonthlyPlan = isMonthly( productSlug );

	/**
	 * Define feature labels.
	 */
	const freeDomainFirstYear = String( translate( 'Your free domain for the first year' ) );
	const freeDomain = String(
		translate( 'Your free domain www.%(slug)s', {
			args: { slug: domainSlug },
		} )
	);
	const bestInClassHosting = String( translate( 'Best-in-class hosting' ) );
	const addFreeSite = String( translate( 'An ad-free site' ) );
	const collectPayments = String( translate( 'The ability to collect payments' ) );
	const emailCustomerSupport = String( translate( 'Unlimited customer support via email' ) );
	const liveChat = String( translate( 'Access to live chat support' ) );
	const earnAdRevenue = String( translate( 'The ability to earn ad revenue' ) );
	const premiumThemes = String( translate( 'Access to premium themes' ) );
	const analyticsIntegration = String( translate( 'Google Analytics integration' ) );
	const accessPlugins = String( translate( 'Access to more than 50,000 plugins' ) );
	const seoTools = String( translate( 'Advanced SEO tools' ) );
	const automatedBackups = String( translate( 'Automated site backups and one-click restore' ) );
	const sftpAndDatabase = String( translate( 'SFTP and database access' ) );
	const acceptPayments = String( translate( 'Accept payments in 60+ countries' ) );
	const shippingCarriers = String( translate( 'Integration with top shipping carriers' ) );
	const premiumDesign = String(
		translate( 'Premium design options customized for online stores' )
	);
	const more = String( translate( 'and more' ) );

	/**
	 * Personal plan
	 */
	if ( isWpComPersonalPlan( productSlug ) ) {
		// Yearly plan
		if ( ! isMonthlyPlan ) {
			// Without domain
			if ( ! hasDomain ) {
				return [
					freeDomainFirstYear,
					bestInClassHosting,
					addFreeSite,
					collectPayments,
					emailCustomerSupport,
				];
			}

			// With domain within first year
			if ( withinFirstYear ) {
				return [
					freeDomain,
					bestInClassHosting,
					addFreeSite,
					collectPayments,
					emailCustomerSupport,
				];
			}

			// With domain post first year
			return [ bestInClassHosting, addFreeSite, collectPayments, emailCustomerSupport ];
		}

		// Monthly plan
		return [ bestInClassHosting, addFreeSite, collectPayments, emailCustomerSupport ];
	}

	/**
	 * Premium plan
	 */
	if ( isWpComPremiumPlan( productSlug ) ) {
		// Yearly plan
		if ( ! isMonthlyPlan ) {
			// Without domain
			if ( ! hasDomain ) {
				return [
					freeDomainFirstYear,
					liveChat,
					earnAdRevenue,
					premiumThemes,
					analyticsIntegration,
					bestInClassHosting,
					addFreeSite,
				];
			}

			// With domain within first year
			if ( withinFirstYear ) {
				return [
					freeDomain,
					liveChat,
					earnAdRevenue,
					premiumThemes,
					analyticsIntegration,
					bestInClassHosting,
					addFreeSite,
					collectPayments,
				];
			}

			// With domain post first year
			return [
				liveChat,
				earnAdRevenue,
				premiumThemes,
				analyticsIntegration,
				bestInClassHosting,
				addFreeSite,
				collectPayments,
			];
		}

		// Monthly plan
		return [
			earnAdRevenue,
			premiumThemes,
			analyticsIntegration,
			bestInClassHosting,
			addFreeSite,
			collectPayments,
			emailCustomerSupport,
		];
	}

	/**
	 * Business plan
	 */
	if ( isWpComBusinessPlan( productSlug ) ) {
		// Yearly plan
		if ( ! isMonthlyPlan ) {
			// Without domain
			if ( ! hasDomain ) {
				return [
					freeDomainFirstYear,
					accessPlugins,
					seoTools,
					automatedBackups,
					sftpAndDatabase,
					liveChat,
					more,
				];
			}

			// With domain within first year
			if ( withinFirstYear ) {
				return [
					freeDomain,
					accessPlugins,
					seoTools,
					automatedBackups,
					sftpAndDatabase,
					liveChat,
					more,
				];
			}

			// With domain post first year
			return [
				accessPlugins,
				seoTools,
				automatedBackups,
				sftpAndDatabase,
				bestInClassHosting,
				liveChat,
				more,
			];
		}

		// Monthly plan
		return [ accessPlugins, seoTools, automatedBackups, sftpAndDatabase, bestInClassHosting, more ];
	}

	/**
	 * eCommerce plan
	 */
	if ( isWpComEcommercePlan( productSlug ) ) {
		// Yearly plan
		if ( ! isMonthlyPlan ) {
			// Without domain
			if ( ! hasDomain ) {
				return [
					freeDomainFirstYear,
					acceptPayments,
					shippingCarriers,
					accessPlugins,
					seoTools,
					liveChat,
					more,
				];
			}

			// With domain within first year
			if ( withinFirstYear ) {
				return [
					freeDomain,
					acceptPayments,
					shippingCarriers,
					accessPlugins,
					seoTools,
					liveChat,
					more,
				];
			}

			// With domain post first year
			return [
				acceptPayments,
				shippingCarriers,
				premiumDesign,
				accessPlugins,
				seoTools,
				liveChat,
				more,
			];
		}

		// Monthly plan
		return [
			acceptPayments,
			shippingCarriers,
			premiumDesign,
			accessPlugins,
			seoTools,
			bestInClassHosting,
			more,
		];
	}

	return [];
}
