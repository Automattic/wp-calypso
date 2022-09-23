import {
	isBiennially,
	isDomainRegistration,
	isGoogleWorkspaceExtraLicence,
	isMonthlyProduct,
	isPlan,
	isTheme,
	isYearly,
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { isWpComProductRenewal as isRenewal } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { isDomainBundledWithPlan } from 'calypso/lib/cart-values/cart-items';
import { DOMAIN_CANCEL, REFUNDS } from 'calypso/lib/url/support';
import CheckoutTermsItem from './checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export enum RefundPolicy {
	DomainNameRegistration = 1,
	DomainNameRegistrationForPlan,
	DomainNameRenewal,
	GenericBiennial,
	GenericMonthly,
	GenericYearly,
	PlanBiennial,
	PlanMonthly,
	PlanYearly,
	PremiumTheme,
}

export function getRefundPolicies( cart: ResponseCart ): RefundPolicy[] {
	const refundPolicies = cart.products.map( ( product ) => {
		if ( isGoogleWorkspaceExtraLicence( product ) ) {
			return undefined;
		}

		if ( isDomainRegistration( product ) ) {
			if ( isDomainBundledWithPlan( cart, product.meta ) ) {
				return RefundPolicy.DomainNameRegistrationForPlan;
			}

			if ( ! product.item_subtotal_integer ) {
				return undefined;
			}

			if ( isRenewal( product ) ) {
				return RefundPolicy.DomainNameRenewal;
			}

			return RefundPolicy.DomainNameRegistration;
		}

		if ( ! product.item_subtotal_integer ) {
			return undefined;
		}

		if ( isTheme( product ) ) {
			return RefundPolicy.PremiumTheme;
		}

		if ( isPlan( product ) ) {
			if ( isMonthlyProduct( product ) ) {
				return RefundPolicy.PlanMonthly;
			}

			if ( isYearly( product ) ) {
				return RefundPolicy.PlanYearly;
			}

			if ( isBiennially( product ) ) {
				return RefundPolicy.PlanBiennial;
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
	} );

	return Array.from( new Set( refundPolicies ) ).filter(
		( refundPolicy ): refundPolicy is RefundPolicy => refundPolicy !== undefined
	);
}

// Get the refund windows in days for the items in the cart
export function getRefundWindows( refundPolicies: RefundPolicy[] ) {
	const refundWindowsInCart = refundPolicies.map( ( refundPolicy ) => {
		switch ( refundPolicy ) {
			case RefundPolicy.DomainNameRegistration:
			case RefundPolicy.DomainNameRegistrationForPlan:
			case RefundPolicy.DomainNameRenewal:
				return 4;

			case RefundPolicy.GenericMonthly:
			case RefundPolicy.PlanMonthly:
				return 7;

			case RefundPolicy.GenericBiennial:
			case RefundPolicy.GenericYearly:
			case RefundPolicy.PlanBiennial:
			case RefundPolicy.PlanYearly:
			case RefundPolicy.PremiumTheme:
				return 14;
		}
	} );

	return Array.from( new Set( refundWindowsInCart ) );
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

		case RefundPolicy.DomainNameRegistrationForPlan:
			text = translate(
				'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.',
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
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for products with two year subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.GenericMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 7 days after purchase or renewal for products with monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.GenericYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for products with yearly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanBiennial:
			text = translate(
				'You understand that {{refundsSupportPage}}plan refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for two year subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}plan refunds{{/refundsSupportPage}} are limited to 7 days after purchase or renewal for monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}plan refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for yearly subscriptions.',
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

	if ( refundPolicies.includes( RefundPolicy.DomainNameRegistrationForPlan ) ) {
		refundPolicies = refundPolicies.filter(
			( refundPolicy ) =>
				refundPolicy !== RefundPolicy.DomainNameRegistration &&
				refundPolicy !== RefundPolicy.DomainNameRenewal
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
