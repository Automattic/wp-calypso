/**
 * External dependencies
 */
import camelCase from 'lodash/string/camelCase';
import merge from 'lodash/object/merge';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import { isPaidWithCreditCard } from 'lib/purchases';
import sortProducts from 'lib/products-values/sort';

function createPurchaseObject( purchase ) {
	const object = {
		id: Number( purchase.ID ),
		active: Boolean( purchase.active ),
		amount: Number( purchase.amount ),
		attachedToPurchaseId: Number( purchase.attached_to_purchase_id ),
		canDisableAutoRenew: Boolean( purchase.can_disable_auto_renew ),
		currencyCode: purchase.currency_code,
		currencySymbol: purchase.currency_symbol,
		domain: purchase.domain,
		error: null,
		expiryDate: purchase.expiry_date,
		expiryMoment: purchase.expiry_date ? i18n.moment( purchase.expiry_date ) : null,
		expiryStatus: camelCase( purchase.expiry_status ),
		hasPrivateRegistration: Boolean( purchase.has_private_registration ),
		includedDomain: purchase.included_domain,
		isCancelable: Boolean( purchase.is_cancelable ),
		isDomainRegistration: Boolean( purchase.is_domain_registration ),
		isRedeemable: Boolean( purchase.is_redeemable ),
		isRefundable: Boolean( purchase.is_refundable ),
		isRenewable: Boolean( purchase.is_renewable ),
		meta: purchase.meta,
		priceText: `${ purchase.currency_symbol }${ purchase.amount } ${ purchase.currency_code }`,
		payment: {
			name: purchase.payment_name,
			type: purchase.payment_type,
			countryCode: purchase.payment_country_code,
			countryName: purchase.payment_country_name
		},
		productId: Number( purchase.product_id ),
		productName: purchase.product_name,
		productSlug: purchase.product_slug,
		refundPeriodInDays: purchase.refund_period_in_days,
		renewDate: purchase.renew_date,
		// only generate a moment if `renewDate` is present and positive
		renewMoment: purchase.renew_date && purchase.renew_date > '0'
			? i18n.moment( purchase.renew_date )
			: null,
		siteId: Number( purchase.blog_id ),
		siteName: purchase.blogname,
		subscribedDate: purchase.subscribed_date,
		subscriptionStatus: purchase.subscription_status,
		tagLine: purchase.tag_line,
		userId: Number( purchase.user_id )
	};

	if ( isPaidWithCreditCard( object ) ) {
		return merge( {}, object, {
			payment: {
				creditCard: {
					id: Number( purchase.payment_card_id ),
					type: purchase.payment_card_type,
					number: Number( purchase.payment_details ),
					expiryDate: purchase.payment_expiry,
					expiryMoment: purchase.payment_expiry ? i18n.moment( purchase.payment_expiry, 'MM/YY' ) : null
				}
			}
		} );
	}

	return object;
}

function createPurchasesArray( dataTransferObject ) {
	if ( ! Array.isArray( dataTransferObject ) ) {
		return [];
	}

	return sortProducts( dataTransferObject.map( createPurchaseObject ) );
}

export default {
	createPurchaseObject,
	createPurchasesArray
};
