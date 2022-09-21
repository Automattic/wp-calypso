import {
	isDomainRegistration,
	isGoogleWorkspaceExtraLicence,
	isMonthlyProduct,
	isTitanMail,
	isYearly,
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { isWpComProductRenewal as isRenewal } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { isDomainBeingUsedForPlan } from 'calypso/lib/cart-values/cart-items';
import { DOMAIN_CANCEL, REFUNDS } from 'calypso/lib/url/support';
import CheckoutTermsItem from './checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export enum RefundPolicy {
	DomainNameRegistration,
	DomainNameRegistrationForPlan,
	DomainNameRenewal,
	GenericMonthly,
	GenericYearly,
	ProfessionalEmailFreeTrialYearly,
	ProfessionalEmailFreeTrialMonthly,
}

export function getRefundPolicies( cart: ResponseCart ): RefundPolicy[] {
	const refundPolicies = cart.products.map( ( product ) => {
		if ( isGoogleWorkspaceExtraLicence( product ) ) {
			return undefined;
		}

		if ( isDomainRegistration( product ) ) {
			if ( isRenewal( product ) ) {
				return RefundPolicy.DomainNameRenewal;
			}

			if ( isDomainBeingUsedForPlan( cart, product.meta ) ) {
				return RefundPolicy.DomainNameRegistrationForPlan;
			}

			return RefundPolicy.DomainNameRegistration;
		}

		if ( isTitanMail( product ) && product.introductory_offer_terms?.enabled ) {
			if ( isMonthlyProduct( product ) ) {
				return RefundPolicy.ProfessionalEmailFreeTrialMonthly;
			}

			return RefundPolicy.ProfessionalEmailFreeTrialYearly;
		}

		if ( ! product.item_subtotal_integer ) {
			return undefined;
		}

		if ( isMonthlyProduct( product ) ) {
			return RefundPolicy.GenericMonthly;
		}

		if ( isYearly( product ) ) {
			return RefundPolicy.GenericYearly;
		}
	} );

	return Array.from( new Set( refundPolicies ) ).filter(
		( refundPolicy ): refundPolicy is RefundPolicy => refundPolicy !== undefined
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
			onClick={ () => gaRecordEvent( 'Upgrades', 'Clicked Cancel Domain Support' ) }
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

		case RefundPolicy.GenericMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 7 days after purchase or renewal for products with monthly subscriptions.',
				{ components: { cancelDomainSupportPage, refundsSupportPage } }
			);
			break;

		case RefundPolicy.GenericYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}refunds{{/refundsSupportPage}} are limited to 14 days after purchase or renewal for products with yearly subscriptions.',
				{ components: { cancelDomainSupportPage, refundsSupportPage } }
			);
			break;

		case RefundPolicy.ProfessionalEmailFreeTrialMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}Professional Email refunds{{/refundsSupportPage}} are limited to 7 days after renewal for monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.ProfessionalEmailFreeTrialYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}Professional Email refunds{{/refundsSupportPage}} are limited to 14 days after renewal for yearly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		default:
			return null;
	}

	return <CheckoutTermsItem>{ text }</CheckoutTermsItem>;
}

export default function RefundPolicies( { cart }: { cart: ResponseCart } ) {
	const refundPolicies = getRefundPolicies( cart );

	return (
		<>
			{ refundPolicies.map( ( policy ) => (
				<RefundPolicyItem key={ policy } refundPolicy={ policy } />
			) ) }
		</>
	);
}
