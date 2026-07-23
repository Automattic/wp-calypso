import {
	getPurchasePayment,
	getPurchasePriceTierList,
	isPurchaseExpiring,
	isPurchaseOneTimePurchase,
} from '@automattic/api-core';
import {
	getAkismetPro500ProductDisplayName,
	getJetpackProductsDisplayNames,
	getPlan,
	getProductFromSlug,
	getStorageAddOnDisplayName,
	is100Year,
	isAkismetPro500,
	isAkismetProduct,
	isConciergeSession,
	isDIFMProduct,
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isJetpackAISlug,
	isJetpackStatsPaidProductSlug,
	isMonthly as isMonthlyPlan,
	isMonthlyProduct,
	isTieredVolumeSpaceAddon,
	isTitanMail,
	isWpComPlan,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	TYPE_PRO,
} from '@automattic/calypso-products';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import i18n from 'i18n-calypso';
import moment from 'moment';
import {
	isA4AHoldingSitePurchase,
	isAgencyPartnerType,
	isMarketplaceHoldingSitePurchase,
} from 'calypso/dashboard/utils/purchase';
import { addPaymentMethod, changePaymentMethod } from '../paths';
import type { Purchase } from '@automattic/api-core';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Raw-`Purchase` ports of the `calypso/lib/purchases` helpers used by the legacy
 * `client/me/purchases` pages while they migrate off the data-stores assembler
 * (SHILL-2256). These read the snake_case `Purchase` from `@automattic/api-core`
 * directly.
 *
 * This module is intentionally local and not exported from any shared package:
 * several of these helpers have historically misleading names and should not be
 * reached for by new code, and the whole set is expected to disappear once the
 * legacy pages are removed. Prefer `@automattic/api-core` transforms or reading
 * raw fields directly where possible.
 */

export function getName( purchase: Purchase ): string {
	if ( isDomainRegistration( purchase ) || isDomainMapping( purchase ) ) {
		return purchase.meta ?? '';
	}
	return purchase.product_name;
}

export function isIncludedWithPlan( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'included';
}

export function isSubscription( purchase: Purchase ): boolean {
	return ! isDomainRegistration( purchase ) && ! isPurchaseOneTimePurchase( purchase );
}

export function isExpiredAndInGracePeriod( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'expired' && purchase.subscription_status === 'active';
}

export function isRemoved( purchase: Purchase ): boolean {
	return purchase.subscription_status !== 'active';
}

export function isExpiredOrRemoved( purchase: Purchase ): boolean {
	return isExpiredAndInGracePeriod( purchase ) || isRemoved( purchase );
}

export function isRenewingBeforeExpiration( purchase: Purchase ): boolean {
	return [ 'active', 'auto-renewing' ].includes( purchase.expiry_status );
}

export function isExpiring( purchase: Purchase ): boolean {
	return [ 'manual-renew', 'expiring' ].includes( purchase.expiry_status );
}

export function isExpiredWithNoAutoRenewAttemptsLeft( purchase: Purchase ): boolean {
	return isExpiredAndInGracePeriod( purchase ) && purchase.is_past_last_auto_renew_attempt_date;
}

export function isMonthlyPurchase( purchase: Purchase ): boolean {
	const plan = getPlan( purchase.product_slug );
	if ( plan ) {
		return isMonthlyPlan( purchase.product_slug );
	}

	// Note that getProductFromSlug() returns a string when given a non-product
	// slug, so we need to check that it's an object before using it.
	const product = getProductFromSlug( purchase.product_slug );
	if ( product && typeof product !== 'string' ) {
		return isMonthlyProduct( product );
	}

	return false;
}

export function isCloseToExpiration( purchase: Purchase ): boolean {
	if ( ! purchase.expiry_date ) {
		return false;
	}

	const expiryThresholdInMonths = isMonthlyPurchase( purchase ) ? 1 : 3;
	return moment( purchase.expiry_date ).diff( Date.now(), 'months' ) < expiryThresholdInMonths;
}

export function hasPaymentMethod( purchase: Purchase ): boolean {
	return purchase.payment_type != null;
}

export function isRechargeable( purchase: Purchase ): boolean {
	return purchase.is_rechargeable;
}

export function isRenewable( purchase: Purchase ): boolean {
	return purchase.is_renewable;
}

export function isPaidWithCredits( purchase: Purchase ): boolean {
	return purchase.payment_type === 'credits';
}

export function isPaidWithCreditCard( purchase: Purchase ): boolean {
	return purchase.payment_type === 'credit_card' && Boolean( purchase.payment_expiry );
}

export function isPaidWithPayPalDirect( purchase: Purchase ): boolean {
	return purchase.payment_type === 'paypal_direct' && Boolean( purchase.payment_expiry );
}

export function isPartnerPurchase( purchase: Purchase ): boolean {
	return !! purchase.partner_name;
}

export function getChangePaymentMethodPath( siteSlug: string, purchase: Purchase ): string {
	const payment = getPurchasePayment( purchase );
	if ( isPaidWithCreditCard( purchase ) && payment.creditCard ) {
		return changePaymentMethod( siteSlug, purchase.ID, payment.creditCard.id );
	}

	return addPaymentMethod( siteSlug, purchase.ID );
}

export function paymentLogoType( purchase: Purchase ): string | null | undefined {
	const payment = getPurchasePayment( purchase );
	if ( isPaidWithCreditCard( purchase ) ) {
		return payment.creditCard?.displayBrand
			? payment.creditCard?.displayBrand
			: payment.creditCard?.type;
	}

	if ( isPaidWithPayPalDirect( purchase ) ) {
		return 'placeholder';
	}

	return payment.type || null;
}

export function isWithinIntroductoryOfferPeriod( purchase: Purchase ): boolean {
	return purchase.introductory_offer?.is_within_period ?? false;
}

export function canEditPaymentDetails( purchase: Purchase ): boolean {
	return (
		// Normally a purchase past its expiry date can't have its payment details
		// edited. We make an exception while it's still in its grace period and its
		// auto-renewal-attempt window hasn't closed: adding/updating the stored card
		// lets it recover on a remaining attempt before it lapses. We gate on that
		// window rather than on auto-renew being enabled — mirroring how a
		// manual-renew purchase can still edit its card before expiry, since adding a
		// card is a valid step toward recovery (often the precursor to re-enabling
		// auto-renew). So auto-renew being off must NOT disqualify it.
		( ! isExpiredOrRemoved( purchase ) ||
			( isExpiredAndInGracePeriod( purchase ) &&
				! isExpiredWithNoAutoRenewAttemptsLeft( purchase ) ) ) &&
		! isPurchaseOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase ) &&
		( ! is100Year( purchase ) || isCloseToExpiration( purchase ) )
	);
}

const formatPurchasePrice = ( price: number, currency: string ) =>
	formatCurrency( price, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

export function getDIFMTieredPurchaseDetails( purchase: Purchase ): {
	extraPageCount: number | null;
	formattedCostOfExtraPages: string | null;
	formattedOneTimeFee: string;
	numberOfIncludedPages: number | null | undefined;
} | null {
	const priceTierList = getPurchasePriceTierList( purchase );
	if (
		! purchase ||
		! isDIFMProduct( purchase ) ||
		! priceTierList ||
		priceTierList.length === 0
	) {
		return null;
	}

	const [ tier0, tier1 ] = priceTierList;
	const perExtraPagePrice = tier1.minimumPrice - tier0.minimumPrice;

	const { maximumUnits: numberOfIncludedPages, minimumPriceDisplay: formattedOneTimeFee } = tier0;
	const noOfPages = purchase.renewal_price_tier_usage_quantity;
	const currencyCode = purchase.currency_code;

	let formattedCostOfExtraPages: string | null = null;
	let extraPageCount: number | null = null;
	if ( noOfPages && numberOfIncludedPages ) {
		extraPageCount = noOfPages - numberOfIncludedPages;
		formattedCostOfExtraPages = formatPurchasePrice(
			extraPageCount * perExtraPagePrice,
			currencyCode
		);
	}

	return { extraPageCount, numberOfIncludedPages, formattedCostOfExtraPages, formattedOneTimeFee };
}

export function subscribedWithinPastWeek( purchase: Purchase ): boolean {
	return (
		purchase.subscribed_date != null &&
		moment( purchase.subscribed_date ).diff( moment(), 'days' ) >= -7
	);
}

export function isRecentMonthlyPurchase( purchase: Purchase ): boolean {
	return subscribedWithinPastWeek( purchase ) && isMonthlyPurchase( purchase );
}

export function needsToRenewSoon( purchase: Purchase ): boolean {
	if (
		isPurchaseOneTimePurchase( purchase ) ||
		isPartnerPurchase( purchase ) ||
		! isRenewable( purchase ) ||
		! purchase.can_explicit_renew
	) {
		return false;
	}

	const isPastExpiry = new Date( purchase.expiry_date ) < new Date();
	return isCloseToExpiration( purchase ) || isPastExpiry;
}

export function shouldAddPaymentSourceInsteadOfRenewingNow( purchase: Purchase ): boolean {
	if ( ! purchase || ! purchase.expiry_date ) {
		return false;
	}
	return moment( purchase.expiry_date ) > moment().add( 3, 'months' );
}

export function monthsUntilCardExpires( purchase: Purchase ): number {
	if ( purchase.payment_expiry_date ) {
		return moment( purchase.payment_expiry_date ).diff( moment(), 'months' );
	}
	const creditCard = getPurchasePayment( purchase ).creditCard;
	return moment( creditCard?.expiryDate, 'MM/YY' ).diff( moment(), 'months' );
}

export function creditCardExpiresBeforeSubscription( purchase: Purchase ): boolean {
	const creditCard = getPurchasePayment( purchase ).creditCard;

	if (
		! isPaidWithCreditCard( purchase ) ||
		! creditCard?.expiryDate ||
		( is100Year( purchase ) && ! isCloseToExpiration( purchase ) )
	) {
		return false;
	}

	if ( purchase.payment_expiry_date ) {
		return moment( purchase.payment_expiry_date ).isBefore( purchase.expiry_date, 'day' );
	}

	return moment( creditCard.expiryDate, 'MM/YY' ).isBefore( purchase.expiry_date, 'months' );
}

export function creditCardHasAlreadyExpired( purchase: Purchase ): boolean {
	const creditCard = getPurchasePayment( purchase ).creditCard;

	if ( ! creditCard?.expiryDate || ! isPaidWithCreditCard( purchase ) ) {
		return false;
	}

	if ( is100Year( purchase ) && ! isCloseToExpiration( purchase ) ) {
		return false;
	}

	if ( purchase.payment_expiry_date ) {
		return moment( purchase.payment_expiry_date ).isBefore( moment(), 'day' );
	}

	return moment( creditCard.expiryDate, 'MM/YY' ).isBefore( moment(), 'months' );
}

export function showCreditCardExpiringWarning( purchase: Purchase ): boolean {
	return (
		! isIncludedWithPlan( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase ) &&
		monthsUntilCardExpires( purchase ) < 3
	);
}

export function getRenewalPriceInSmallestUnit( purchase: Purchase ): number {
	return purchase.sale_amount_integer || purchase.price_integer;
}

export function isRefundable( purchase: Purchase ): boolean {
	return purchase.is_refundable && purchase.product_type !== 'saas_plugin';
}

export function hasAmountAvailableToRefund( purchase: Purchase ): boolean {
	return isRefundable( purchase ) && purchase.refund_amount > 0;
}

export function canAutoRenewBeTurnedOff( purchase: Purchase ): boolean {
	if ( isIncludedWithPlan( purchase ) ) {
		return false;
	}

	if ( isExpiredOrRemoved( purchase ) ) {
		return false;
	}

	if ( hasAmountAvailableToRefund( purchase ) ) {
		return true;
	}

	return purchase.is_auto_renew_enabled;
}

export function isWithinRefundWindowDowngradeEligible( purchase: Purchase ): boolean {
	return purchase.is_within_initial_refund_window && ! isExpiredOrRemoved( purchase );
}

export function getDisplayName( purchase: Purchase ): TranslateResult {
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames( 'full' );
	const productName = purchase.product_name;
	const productSlug = purchase.product_slug;
	const quantity = purchase.renewal_price_tier_usage_quantity;
	const priceTierList = getPurchasePriceTierList( purchase );

	if ( isJetpackAISlug( productSlug ) && quantity && priceTierList?.length ) {
		return i18n.translate( '%(productName)s (%(quantity)s requests per month)', {
			args: {
				productName: jetpackProductsDisplayNames[ productSlug ],
				quantity: formatNumber( quantity ),
			},
		} );
	}

	if ( isJetpackStatsPaidProductSlug( productSlug ) && quantity && priceTierList?.length ) {
		return i18n.translate( '%(productName)s (%(quantity)s views per month)', {
			args: {
				productName: jetpackProductsDisplayNames[ productSlug ],
				quantity: formatNumber( quantity ),
			},
		} );
	}

	if ( jetpackProductsDisplayNames[ productSlug ] ) {
		return jetpackProductsDisplayNames[ productSlug ];
	}

	if ( isTieredVolumeSpaceAddon( purchase ) ) {
		return getStorageAddOnDisplayName( productName, quantity ?? null );
	}

	if ( isAkismetPro500( purchase ) ) {
		return getAkismetPro500ProductDisplayName( productName, quantity ?? null );
	}

	if ( purchase.is_plan && productName ) {
		return i18n.translate( '%(productName)s Plan', {
			args: {
				productName: productName.replace( /\s*\(.*$/, '' ).trim(),
			},
		} );
	}

	return getName( purchase );
}

export function purchaseType( purchase: Purchase ): string | null {
	if ( purchase.product_type === 'theme' ) {
		return i18n.translate( 'Premium Theme' );
	}

	if ( isConciergeSession( purchase ) ) {
		return i18n.translate( 'One-on-one Support' );
	}

	if ( isPartnerPurchase( purchase ) ) {
		if ( isAgencyPartnerType( purchase.partner_type ?? '' ) ) {
			return i18n.translate( 'Agency Managed Plan' );
		}

		return i18n.translate( 'Host Managed Plan' );
	}

	if ( purchase.is_plan ) {
		return null;
	}

	if ( isDomainRegistration( purchase ) ) {
		return purchase.product_name;
	}

	if ( isDomainMapping( purchase ) ) {
		return purchase.product_name;
	}

	if ( isAkismetProduct( purchase ) ) {
		return null;
	}

	if ( isMarketplaceHoldingSitePurchase( purchase ) ) {
		return null;
	}

	if ( isA4AHoldingSitePurchase( purchase ) ) {
		return null;
	}

	if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
		return i18n.translate( 'Mailboxes and Productivity Tools at %(domain)s', {
			textOnly: true,
			args: {
				domain: purchase.meta as string,
			},
		} );
	}

	if ( isTitanMail( purchase ) ) {
		return i18n.translate( 'Mailboxes at %(domain)s', {
			textOnly: true,
			args: {
				domain: purchase.meta as string,
			},
		} );
	}

	if ( purchase.product_type === 'marketplace_plugin' || purchase.product_type === 'saas_plugin' ) {
		return i18n.translate( 'Plugin' );
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}

export function shouldRenderMonthlyRenewalOption( purchase: Purchase ): boolean {
	if ( ! purchase || ! purchase.expiry_date ) {
		return false;
	}

	if ( ! isWpComPlan( purchase.product_slug ) ) {
		return false;
	}

	const plan = getPlan( purchase.product_slug );

	if ( ! [ TERM_ANNUALLY, TERM_BIENNIALLY, TERM_TRIENNIALLY ].includes( plan?.term ?? '' ) ) {
		return false;
	}

	if ( TYPE_PRO === plan?.type ) {
		return false;
	}

	const willExpireWithoutRenewal = isPurchaseExpiring( purchase );
	const daysTillExpiry = moment( purchase.expiry_date ).diff( Date.now(), 'days' );

	if ( willExpireWithoutRenewal && daysTillExpiry < 90 ) {
		return true;
	}

	if ( ! willExpireWithoutRenewal && daysTillExpiry < 30 ) {
		return true;
	}

	return false;
}
