import type { Purchase, PriceTierEntry, PurchasePriceTier } from './types';

/**
 * Derived, non-trivial shapes and predicates for a raw `Purchase`.
 *
 * The rest of a `Purchase` is a flat, directly-accessible object. The handful
 * of properties here are the ones that the legacy `createPurchaseObject`
 * assembler used to reshape (nested objects, value-mapped enums, coercions),
 * so they cannot be replaced by a plain field rename. Consumers migrating off
 * the assembler should read those properties through these helpers until they
 * can be migrated to the raw properties instead.
 */

/**
 * @deprecated Migration shim; read the `payment_card_*` fields off the
 * `Purchase` instead. See {@link PurchasePayment}.
 *
 * Field-for-field: `id` is `payment_card_id` (raw, this may be a numeric
 * string), `type` is `payment_card_type`, `displayBrand` is
 * `payment_card_display_brand`, `processor` is `payment_card_processor`,
 * `number` is `payment_details` and `expiryDate` is `payment_expiry`. All but
 * `displayBrand` may be undefined on the raw purchase, where this shape
 * substitutes `''`.
 */
export interface PurchasePaymentCreditCard {
	id: number;
	type: string;
	displayBrand: string | null;
	processor: string;
	number: string;
	/**
	 * The expiry date in MM/YY if the payment method has one.
	 *
	 * Use `payment_expiry_date` on the Purchase if possible as it will be more
	 * accurate.
	 */
	expiryDate: string;
}

/**
 * @deprecated Migration shim; read the flat `payment_*` fields off the
 * `Purchase` instead.
 *
 * This is the nested payment object the legacy `createPurchaseObject`
 * assembler built (SHILL-2256). It exists only so that code moving off the
 * assembler can keep its existing property reads while the rest of the
 * purchase is migrated; unlike the other shapes in this module it adds nothing
 * the raw purchase does not already carry, so new code should read the raw
 * fields directly and existing consumers of {@link getPurchasePayment} should
 * be migrated off it.
 *
 * Field-for-field: `name` is `payment_name`, `type` is `payment_type`,
 * `countryCode` is `payment_country_code`, `countryName` is
 * `payment_country_name`, `storedDetailsId` is `stored_details_id`,
 * `expiryDate` is `payment_expiry` (PayPal Direct only) and `creditCard` is the
 * `payment_card_*` group (credit cards only). `paymentPartner` is vestigial and
 * never populated.
 */
export interface PurchasePayment {
	name: string | undefined;
	type: string | undefined;
	countryCode: string | undefined | null;
	countryName: string | undefined;
	storedDetailsId: string | number | undefined | null;
	/**
	 * The expiry date in MM/YY if the payment method has one.
	 *
	 * Use `payment_expiry_date` on the Purchase if possible as it will be more
	 * accurate.
	 */
	expiryDate?: string;
	creditCard?: PurchasePaymentCreditCard;
	paymentPartner?: string;
}

export interface PurchaseIntroductoryOffer {
	costPerInterval: number;
	costPerIntervalInteger: number;
	endDate: string;
	intervalCount: number;
	intervalUnit: string;
	isWithinPeriod: boolean;
	transitionAfterRenewalCount: number;
	isNextRenewalUsingOffer: boolean;
	remainingRenewalsUsingOffer: number;
	shouldProrateWhenOfferEnds: boolean;
	isNextRenewalProrated: boolean;
}

/**
 * Build the nested payment object for a purchase.
 *
 * The raw purchase exposes payment details as flat `payment_*` fields; this
 * groups them into the shape the app expects, adding the `creditCard` sub-object
 * only for card payments and the paypal_direct expiry date.
 * @deprecated Migration shim; read the flat `payment_*` fields off the
 * `Purchase` instead. Every property this returns is a rename of a field the
 * purchase already carries (see {@link PurchasePayment} for the mapping). The
 * only work it adds is gating `creditCard` and `expiryDate` on `payment_type`,
 * coercing `payment_card_id` with `Number()` (raw, it may be a numeric string)
 * and defaulting the other card fields to `''` — all of which a caller reading
 * a single property can do more cheaply itself. This exists to let code migrate
 * off the `createPurchaseObject` assembler (SHILL-2256) a page at a time; it
 * should go away once its callers have.
 */
export function getPurchasePayment( purchase: Purchase ): PurchasePayment {
	const payment: PurchasePayment = {
		name: purchase.payment_name,
		type: purchase.payment_type,
		countryCode: purchase.payment_country_code,
		countryName: purchase.payment_country_name,
		storedDetailsId: purchase.stored_details_id,
	};

	if ( purchase.payment_type === 'credit_card' ) {
		payment.creditCard = {
			id: Number( purchase.payment_card_id ),
			type: purchase.payment_card_type ?? '',
			displayBrand: purchase.payment_card_display_brand,
			processor: purchase.payment_card_processor ?? '',
			number: purchase.payment_details ?? '',
			expiryDate: purchase.payment_expiry ?? '',
		};
	}

	if ( purchase.payment_type === 'paypal_direct' ) {
		payment.expiryDate = purchase.payment_expiry;
	}

	return payment;
}

/**
 * Map the raw introductory offer (snake_case, string/number-loose) to the
 * camelCase, coerced shape used across the app. Returns null when the purchase
 * has no introductory offer.
 */
export function getPurchaseIntroductoryOffer(
	purchase: Purchase
): PurchaseIntroductoryOffer | null {
	const offer = purchase.introductory_offer;
	if ( ! offer ) {
		return null;
	}
	return {
		costPerInterval: Number( offer.cost_per_interval ),
		costPerIntervalInteger: Number( offer.cost_per_interval_integer ),
		endDate: String( offer.end_date ),
		intervalCount: Number( offer.interval_count ),
		intervalUnit: String( offer.interval_unit ),
		isWithinPeriod: Boolean( offer.is_within_period ),
		transitionAfterRenewalCount: Number( offer.transition_after_renewal_count ),
		isNextRenewalUsingOffer: Boolean( offer.is_next_renewal_using_offer ),
		remainingRenewalsUsingOffer: Number( offer.remaining_renewals_using_offer ),
		shouldProrateWhenOfferEnds: Boolean( offer.should_prorate_when_offer_ends ),
		isNextRenewalProrated: Boolean( offer.is_next_renewal_prorated ),
	};
}

/**
 * Map the raw price tier list to the trimmed camelCase shape used by the app.
 * Returns undefined when the purchase has no price tier list.
 */
export function getPurchasePriceTierList( purchase: Purchase ): PurchasePriceTier[] | undefined {
	return purchase.price_tier_list?.map( ( rawTier: PriceTierEntry ): PurchasePriceTier => ( {
		minimumUnits: rawTier.minimum_units,
		maximumUnits: rawTier.maximum_units,
		minimumPrice: rawTier.minimum_price,
		maximumPrice: rawTier.maximum_price,
		minimumPriceDisplay: rawTier.minimum_price_display,
		maximumPriceDisplay: rawTier.maximum_price_display,
	} ) );
}

/**
 * The raw `expiry_status` uses hyphenated values (e.g. 'auto-renewing',
 * 'manual-renew', 'one-time-purchase'). The legacy assembler camelCased these,
 * so the predicates below read the raw hyphenated values directly and give both
 * Calypso and the Dashboard a single shared definition.
 */
export function isPurchaseAutoRenewing( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'auto-renewing';
}

export function isPurchaseOneTimePurchase( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'one-time-purchase';
}

export function isPurchaseExpiring( purchase: Purchase ): boolean {
	return [ 'manual-renew', 'expiring' ].includes( purchase.expiry_status );
}
