import { camelCase } from 'lodash';

function createPurchaseObject( purchase ) {
	const object = {
		id: Number( purchase.ID ),
		active: Boolean( purchase.active ),
		amount: Number( purchase.amount ),
		attachedToPurchaseId: Number( purchase.attached_to_purchase_id ),
		billPeriodDays: Number( purchase.bill_period_days ),
		billPeriodLabel: purchase.bill_period_label,
		mostRecentRenewDate: purchase.most_recent_renew_date,
		canDisableAutoRenew: Boolean( purchase.can_disable_auto_renew ),
		canReenableAutoRenewal: Boolean( purchase.can_reenable_auto_renewal ),
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
		blogCreatedDate: purchase.blog_created_date,
		expiryDate: purchase.expiry_date,
		expiryStatus: camelCase( purchase.expiry_status ),
		iapPurchaseManagementLink: purchase.iap_purchase_management_link,
		includedDomain: purchase.included_domain,
		includedDomainPurchaseAmount: purchase.included_domain_purchase_amount,
		introductoryOffer: purchase.introductory_offer
			? {
					costPerInterval: Number( purchase.introductory_offer.cost_per_interval ),
					endDate: String( purchase.introductory_offer.end_date ),
					intervalCount: Number( purchase.introductory_offer.interval_count ),
					intervalUnit: String( purchase.introductory_offer.interval_unit ),
					isWithinPeriod: Boolean( purchase.introductory_offer.is_within_period ),
					transitionAfterRenewalCount: Number(
						purchase.introductory_offer.transition_after_renewal_count
					),
					isNextRenewalUsingOffer: Boolean(
						purchase.introductory_offer.is_next_renewal_using_offer
					),
					remainingRenewalsUsingOffer: Number(
						purchase.introductory_offer.remaining_renewals_using_offer
					),
					shouldProrateWhenOfferEnds: Boolean(
						purchase.introductory_offer.should_prorate_when_offer_ends
					),
					isNextRenewalProrated: Boolean( purchase.introductory_offer.is_next_renewal_prorated ),
			  }
			: null,
		isCancelable: Boolean( purchase.is_cancelable ),
		isDomainRegistration: Boolean( purchase.is_domain_registration ),
		isLocked: Boolean( purchase.is_locked ),
		isInAppPurchase: Boolean( purchase.is_iap_purchase ),
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
			storedDetailsId: purchase.stored_details_id,
		},
		pendingTransfer: Boolean( purchase.pending_transfer ),
		productId: Number( purchase.product_id ),
		productName: purchase.product_name,
		productSlug: purchase.product_slug,
		productDisplayPrice: purchase.product_display_price,
		totalRefundAmount: Number( purchase.total_refund_amount ),
		totalRefundText: purchase.total_refund_text,
		refundAmount: Number( purchase.refund_amount ),
		refundOptions: purchase.refund_options,
		refundText: purchase.refund_text,
		refundPeriodInDays: purchase.refund_period_in_days,
		regularPriceText: purchase.regular_price_text,
		renewDate: purchase.renew_date,
		saleAmount: purchase.sale_amount,
		siteId: Number( purchase.blog_id ),
		siteName: purchase.blogname,
		subscribedDate: purchase.subscribed_date,
		subscriptionStatus: purchase.subscription_status,
		tagLine: purchase.tag_line,
		taxAmount: purchase.tax_amount,
		taxText: purchase.tax_text,
		purchaseRenewalQuantity: purchase.renewal_price_tier_usage_quantity || null,
		userId: Number( purchase.user_id ),
		isAutoRenewEnabled: purchase.auto_renew === '1',
	};

	if ( 'credit_card' === purchase.payment_type ) {
		object.payment.creditCard = {
			id: Number( purchase.payment_card_id ),
			type: purchase.payment_card_type,
			processor: purchase.payment_card_processor,
			number: purchase.payment_details,
			expiryDate: purchase.payment_expiry,
		};
	}

	if ( 'paypal_direct' === purchase.payment_type ) {
		object.payment.expiryDate = purchase.payment_expiry;
	}

	return object;
}

export function createPurchasesArray( dataTransferObject ) {
	if ( ! Array.isArray( dataTransferObject ) ) {
		return [];
	}

	return dataTransferObject.map( createPurchaseObject );
}
