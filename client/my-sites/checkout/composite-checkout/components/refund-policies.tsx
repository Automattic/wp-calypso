import {
	isAddOn,
	isDomainRegistration,
	isGoogleWorkspace,
	isGoogleWorkspaceExtraLicence,
	isMonthlyProduct,
	isPlan,
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
	AddOnYearly,
	DomainNameRegistration,
	DomainNameRegistrationForPlan,
	DomainNameRenewal,
	GenericMonthly,
	GenericYearly,
	GoogleWorkspaceMonthly,
	GoogleWorkspaceYearly,
	PlanMonthly,
	PlanYearly,
	ProfessionalEmailFreeTrialYearly,
	ProfessionalEmailFreeTrialMonthly,
	ProfessionalEmailMonthly,
	ProfessionalEmailYearly,
}

export function getRefundPolicies( cart: ResponseCart ): RefundPolicy[] {
	const refundPolicies = cart.products.map( ( product ) => {
		if ( ! product.item_subtotal_integer && ! product.introductory_offer_terms?.enabled ) {
			return undefined;
		}

		if ( isAddOn( product ) ) {
			return RefundPolicy.AddOnYearly;
		} else if ( isDomainRegistration( product ) ) {
			if ( isRenewal( product ) ) {
				return RefundPolicy.DomainNameRenewal;
			} else if ( isDomainBeingUsedForPlan( cart, product.meta ) ) {
				return RefundPolicy.DomainNameRegistrationForPlan;
			}

			return RefundPolicy.DomainNameRegistration;
		} else if ( isGoogleWorkspace( product ) && ! isGoogleWorkspaceExtraLicence( product ) ) {
			if ( isMonthlyProduct( product ) ) {
				return RefundPolicy.GoogleWorkspaceMonthly;
			}

			return RefundPolicy.GoogleWorkspaceYearly;
		} else if ( isPlan( product ) ) {
			if ( isMonthlyProduct( product ) ) {
				return RefundPolicy.PlanMonthly;
			}

			return RefundPolicy.PlanYearly;
		} else if ( isTitanMail( product ) ) {
			if ( product.introductory_offer_terms?.enabled ) {
				if ( isMonthlyProduct( product ) ) {
					return RefundPolicy.ProfessionalEmailFreeTrialMonthly;
				}

				return RefundPolicy.ProfessionalEmailFreeTrialYearly;
			} else if ( isMonthlyProduct( product ) ) {
				return RefundPolicy.ProfessionalEmailMonthly;
			}

			return RefundPolicy.ProfessionalEmailYearly;
		} else if ( isMonthlyProduct( product ) ) {
			return RefundPolicy.GenericMonthly;
		} else if ( isYearly( product ) ) {
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
		case RefundPolicy.AddOnYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}add-on refunds{{/refundsSupportPage}} are limited to 14 days after purchase.',
				{ components: { refundsSupportPage } }
			);
			break;

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

		case RefundPolicy.GoogleWorkspaceMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}Google Workspace refunds{{/refundsSupportPage}} are limited to 7 days after purchase for monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.GoogleWorkspaceYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}Google Workspace refunds{{/refundsSupportPage}} are limited to 14 days after purchase for yearly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}plan refunds{{/refundsSupportPage}} are limited to 7 days after purchase for monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.PlanYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}plan refunds{{/refundsSupportPage}} are limited to 14 days after purchase for yearly subscriptions.',
				{ components: { refundsSupportPage } }
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

		case RefundPolicy.ProfessionalEmailMonthly:
			text = translate(
				'You understand that {{refundsSupportPage}}Professional Email refunds{{/refundsSupportPage}} are limited to 7 days after purchase for monthly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		case RefundPolicy.ProfessionalEmailYearly:
			text = translate(
				'You understand that {{refundsSupportPage}}Professional Email refunds{{/refundsSupportPage}} are limited to 14 days after purchase for yearly subscriptions.',
				{ components: { refundsSupportPage } }
			);
			break;

		// Some RefundPolicy's are deliberately unhandled, for example when they are too generic.
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
