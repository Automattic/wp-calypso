/**
 * External dependencies
 */

import { camelCase } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import sortProducts from 'lib/products-values/sort';

function createPurchaseObject( purchase ) {
	const object = {
		id: Number( purchase.ID ),
		active: Boolean( purchase.active ),
		amount: Number( purchase.amount ),
		attachedToPurchaseId: Number( purchase.attached_to_purchase_id ),
		mostRecentRenewDate: purchase.most_recent_renew_date,
		mostRecentRenewMoment: purchase.most_recent_renew_date
			? i18n.moment( purchase.most_recent_renew_date )
			: null,
		canDisableAutoRenew: Boolean( purchase.can_disable_auto_renew ),
		canExplicitRenew: Boolean( purchase.can_explicit_renew ),
		costToUnbundle: purchase.cost_to_unbundle
			? Number( purchase.cost_to_unbundle )
			: Number( purchase.amount ),
		costToUnbundleText: purchase.cost_to_unbundle_display
			? purchase.cost_to_unbundle_display
			: purchase.price_text,
		currencyCode: purchase.currency_code,
		currencySymbol: purchase.currency_symbol,
		description: purchase.description,
		domain: purchase.domain,
		domainRegistrationAgreementUrl: purchase.domain_registration_agreement_url || null,
		error: null,
		expiryDate: purchase.expiry_date,
		expiryMoment: purchase.expiry_date ? i18n.moment( purchase.expiry_date ) : null,
		expiryStatus: camelCase( purchase.expiry_status ),
		includedDomain: purchase.included_domain,
		includedDomainPurchaseAmount: purchase.included_domain_purchase_amount,
		isCancelable: Boolean( purchase.is_cancelable ),
		isDomainRegistration: Boolean( purchase.is_domain_registration ),
		isRechargeable: Boolean( purchase.is_rechargable ),
		isRefundable: Boolean( purchase.is_refundable ),
		isRenewable: Boolean( purchase.is_renewable ),
		isRenewal: Boolean( purchase.is_renewal ),
		meta: purchase.meta,
		priceText: purchase.price_text,
		partnerName: purchase.partner_name,
		partnerSlug: purchase.partner_slug,
		partnerKeyId: purchase.partner_key_id,
		payment: {
			name: purchase.payment_name,
			type: purchase.payment_type,
			countryCode: purchase.payment_country_code,
			countryName: purchase.payment_country_name,
		},
		pendingTransfer: Boolean( purchase.pending_transfer ),
		productId: Number( purchase.product_id ),
		productName: purchase.product_name,
		productSlug: purchase.product_slug,
		refundAmount: Number( purchase.refund_amount ),
		refundOptions: purchase.refund_options,
		refundText: purchase.refund_text,
		refundPeriodInDays: purchase.refund_period_in_days,
		renewDate: purchase.renew_date,
		// only generate a moment if `renewDate` is present and positive
		renewMoment:
			purchase.renew_date && purchase.renew_date > '0' ? i18n.moment( purchase.renew_date ) : null,
		saleAmount: purchase.sale_amount,
		siteId: Number( purchase.blog_id ),
		siteName: purchase.blogname,
		subscribedDate: purchase.subscribed_date,
		subscribedMoment: purchase.subscribed_date ? i18n.moment( purchase.subscribed_date ) : null,
		subscriptionStatus: purchase.subscription_status,
		tagLine: purchase.tag_line,
		taxAmount: purchase.tax_amount,
		taxText: purchase.tax_text,
		userId: Number( purchase.user_id ),
	};

	if ( 'credit_card' === purchase.payment_type ) {
		const payment = Object.assign( {}, object.payment, {
			creditCard: {
				id: Number( purchase.payment_card_id ),
				type: purchase.payment_card_type,
				processor: purchase.payment_card_processor,
				number: purchase.payment_details,
				expiryDate: purchase.payment_expiry,
				expiryMoment: purchase.payment_expiry
					? i18n.moment( purchase.payment_expiry, 'MM/YY' )
					: null,
			},
		} );

		return Object.assign( {}, object, { payment } );
	}

	if ( 'paypal_direct' === purchase.payment_type ) {
		object.payment.expiryMoment = purchase.payment_expiry
			? i18n.moment( purchase.payment_expiry, 'MM/YY' )
			: null;
	}

	return object;
}

export function createPurchasesArray( dataTransferObject ) {
	if ( ! Array.isArray( dataTransferObject ) ) {
		return [];
	}

	return sortProducts( dataTransferObject.map( createPurchaseObject ) );
}
