import {
	isBiennially,
	isDomainRegistration,
	isGoogleWorkspaceExtraLicence,
	isMonthlyProduct,
	isPlan,
	isYearly,
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { isWpComProductRenewal as isRenewal } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { DOMAIN_CANCEL, REFUNDS } from 'calypso/lib/url/support';
import CheckoutTermsItem from './checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export enum RefundPolicy {
	DomainNameRegistration = 1,
	DomainNameRenewal,
	GenericBiennial,
	GenericMonthly,
	GenericYearly,
	NonRefundable,
	PlanBiennialBundle,
	PlanMonthlyBundle,
	PlanYearlyBundle,
	PlanMonthlyRenewal,
	PlanYearlyRenewal,
	PlanBiennialRenewal,
	PremiumTheme,
}

export function getRefundPolicies( cart: ResponseCart ): RefundPolicy[] {
	const refundPolicies = cart.products.map( ( product ) => {
		if ( isGoogleWorkspaceExtraLicence( product ) ) {
			return RefundPolicy.NonRefundable;
		}

		if ( ! product.item_subtotal_integer ) {
			return undefined;
		}

		if ( isDomainRegistration( product ) ) {
			if ( isRenewal( product ) ) {
				return RefundPolicy.DomainNameRenewal;
			}

			return RefundPolicy.DomainNameRegistration;
		}

		if ( product.product_slug === 'premium_theme' ) {
			return RefundPolicy.PremiumTheme;
		}

		if ( isPlan( product ) ) {
			// Monthly plans can have an associated "bundled" domain, even if the domain price
			// ultimately isn't free (i.e. it's not a real bundle). For that reason, we look at
			// `product.extra.domain_to_bundle` here instead of `cart.bundled_domain`.
			if ( product.extra?.domain_to_bundle ) {
				if ( isMonthlyProduct( product ) ) {
					return RefundPolicy.PlanMonthlyBundle;
				}

				if ( isYearly( product ) ) {
					return RefundPolicy.PlanYearlyBundle;
				}

				if ( isBiennially( product ) ) {
					return RefundPolicy.PlanBiennialBundle;
				}
			}

			if ( isRenewal( product ) ) {
				if ( isMonthlyProduct( product ) ) {
					return RefundPolicy.PlanMonthlyRenewal;
				}

				if ( isYearly( product ) ) {
					return RefundPolicy.PlanYearlyRenewal;
				}

				if ( isBiennially( product ) ) {
					return RefundPolicy.PlanBiennialRenewal;
				}
			}
		}

		if ( isMonthlyProduct( product ) ) {
			return RefundPolicy.GenericMonthly;
		}

		if ( isYearly( product ) ) {
			return RefundPolicy.GenericYearly;
		}

		if ( isBiennially( product ) ) {
			return RefundPolicy.GenericBiennial;
		}

		return RefundPolicy.NonRefundable;
	} );

	return Array.from( new Set( refundPolicies ) ).filter(
		( refundPolicy ): refundPolicy is RefundPolicy => refundPolicy !== undefined
	);
}

// Get the refund windows in days for the items in the cart
export function getRefundWindows( refundPolicies: RefundPolicy[] ) {
	const refundWindows = refundPolicies.map( ( refundPolicy ) => {
		switch ( refundPolicy ) {
			case RefundPolicy.DomainNameRegistration:
			case RefundPolicy.DomainNameRenewal:
				return 4;

			case RefundPolicy.GenericMonthly:
			case RefundPolicy.PlanMonthlyBundle:
				return 7;

			case RefundPolicy.PlanBiennialBundle:
			case RefundPolicy.PlanYearlyBundle:
			case RefundPolicy.PlanBiennialRenewal:
			case RefundPolicy.PlanYearlyRenewal:
			case RefundPolicy.GenericBiennial:
			case RefundPolicy.GenericYearly:
			case RefundPolicy.PremiumTheme:
				return 14;
		}
	} );

	return Array.from( new Set( refundWindows ) ).filter(
		( refundWindow ): refundWindow is 4 | 7 | 14 => refundWindow !== undefined
	);
}

function RefundPolicyItem( { refundPolicy }: { refundPolicy: RefundPolicy } ) {
	const translate = useTranslate();

	const refundsSupportPage = (
		<a
			href={ localizeUrl( REFUNDS ) }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => gaRecordEvent( 'Upgrades', 'Clicked Refund Support Link' ) }
		/>
	);
	const cancelDomainSupportPage = (
		<a
			href={ localizeUrl( DOMAIN_CANCEL ) }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => gaRecordEvent( 'Upgrades', 'Clicked Cancel Domain Support Link' ) }
		/>
	);

	let text;

	switch ( refundPolicy ) {
		case RefundPolicy.DomainNameRegistration:
			text = translate(
				'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.DomainNameRenewal:
			text = translate(
				'Please note: to receive a {{refundsSupportPage}}refund for a domain renewal{{/refundsSupportPage}}, you must {{cancelDomainSupportPage}}cancel your domain{{/cancelDomainSupportPage}} within 96 hours of the renewal transaction. Canceling the domain means it will be deleted and you may not be able to recover it.',
				{ components: { cancelDomainSupportPage, refundsSupportPage } }
			);
			break;

		case RefundPolicy.GenericBiennial:
		case RefundPolicy.PlanBiennialRenewal:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for non-domain products with two year subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.GenericMonthly:
		case RefundPolicy.PlanMonthlyRenewal:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 7 days after purchase or renewal for non-domain products with monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.GenericYearly:
		case RefundPolicy.PlanYearlyRenewal:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for non-domain products with yearly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanBiennialBundle:
			text = translate(
				'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration and {{refundsSupportPage}}two year plan refunds{{/refundsSupportPage}} are limited to 14 days after purchase. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanMonthlyBundle:
			text = translate(
				'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration and {{refundsSupportPage}}monthly plan refunds{{/refundsSupportPage}} are limited to 7 days after purchase.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanYearlyBundle:
			text = translate(
				'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration and {{refundsSupportPage}}yearly plan refunds{{/refundsSupportPage}} are limited to 14 days after purchase. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PremiumTheme:
			text = translate(
				'You understand that {{refundsSupportPage}}theme refunds{{/refundsSupportPage}} are limited to 14 days after purchase.',
				{ components: { refundsSupportPage } }
			);
			break;

		default:
			return null;
	}

	return <CheckoutTermsItem>{ text }</CheckoutTermsItem>;
}

export default function RefundPolicies( { cart }: { cart: ResponseCart } ) {
	let refundPolicies = getRefundPolicies( cart );

	const hasPlanBundleRefundPolicy = refundPolicies.some(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.PlanBiennialBundle ||
			refundPolicy === RefundPolicy.PlanMonthlyBundle ||
			refundPolicy === RefundPolicy.PlanYearlyBundle
	);

	if ( hasPlanBundleRefundPolicy ) {
		// The plan bundle refund policies indicate that the user already has a plan and a free
		// domain in their cart. If they also have a paid domain, it gets repetitive to show them
		// the DomainNameRegistration refund policy text. Therefore we exclude it.
		refundPolicies = refundPolicies.filter(
			( refundPolicy ) => refundPolicy !== RefundPolicy.DomainNameRegistration
		);
	}

	return (
		<>
			{ refundPolicies.map( ( policy ) => (
				<RefundPolicyItem key={ policy } refundPolicy={ policy } />
			) ) }
		</>
	);
}
