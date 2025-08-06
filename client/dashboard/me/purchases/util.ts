import { isWithinLast, isWithinNext } from '../../utils/datetime';
import { SubscriptionBillPeriod, AkismetPlans } from './constants';
import type { Purchase } from '../../data/purchase';

export function isTemporarySitePurchase( purchase: Purchase ): boolean {
	const { domain } = purchase;
	// Currently only Jetpack, Akismet, A4A, and some Marketplace products allow siteless/userless(license-based) purchases which require a temporary
	// site(s) to work. This function may need to be updated in the future as additional products types
	// incorporate siteless/userless(licensebased) product based purchases..
	return /^siteless\.(jetpack|akismet|marketplace\.wp|agencies\.automattic|a4a)\.com$/.test(
		domain
	);
}

export function isRenewing( purchase: Purchase ): boolean {
	return [ 'active', 'auto-renewing' ].includes( purchase.expiry_status );
}

export function isExpiring( purchase: Purchase ) {
	return [ 'manual-renew', 'expiring' ].includes( purchase.expiry_status );
}

export function isExpired( purchase: Purchase ) {
	return 'expired' === purchase.expiry_status;
}

export function isIncludedWithPlan( purchase: Purchase ) {
	return 'included' === purchase.expiry_status;
}

export function isOneTimePurchase( purchase: Purchase ) {
	return 'one-time-purchase' === purchase.expiry_status;
}

// AKISMET_ENTERPRISE_YEARLY has a $0 plan for nonprofits, so we need to check the amount
// to determine if it's free or not.
export function isAkismetFreeProduct( product: Purchase ): boolean {
	return (
		AkismetPlans.PRODUCT_AKISMET_FREE === product.product_slug ||
		( AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_YEARLY === product.product_slug &&
			product.amount === 0 )
	);
}

/**
 * Determines if this is a recent monthly purchase (bought within the past week).
 *
 * This is often used to ensure that notices about purchases which expire
 * "soon" are not displayed with error styling to a user who just purchased a
 * monthly subscription (which by definition will expire relatively soon).
 */
export function isRecentMonthlyPurchase( purchase: Purchase ): boolean {
	return Boolean(
		purchase.subscribed_date &&
			isWithinLast( new Date( purchase.subscribed_date ), 7, 'days' ) &&
			purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD
	);
}

/**
 * Returns true for purchases that are expired or expiring/renewing soon.
 *
 * The latter is defined as within one month of expiration for monthly
 * subscriptions (i.e., one billing period) and within three months of
 * expiration for everything else.
 */
export function isCloseToExpiration( purchase: Purchase ): boolean {
	if ( ! purchase.expiry_date ) {
		return false;
	}
	const threshold =
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD
			? SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD
			: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD * 3;
	return isWithinNext( new Date( purchase.expiry_date ), threshold, 'days' );
}

/**
 * Transforms a credit card expiry date like `11/23` into a Date representing 2023-11-30.
 *
 * Returns the last day of the month because credit cards typically expire at the end of the valid month.
 */
function getDateFromCreditCardExpiry( cardExpiryDate: string ): Date {
	const [ month, year ] = cardExpiryDate.split( '/' );
	if ( ! month || ! year ) {
		throw new Error( `Could not parse credit card date '${ cardExpiryDate }'` );
	}
	const monthNumber = parseInt( month );
	const yearNumber = parseInt( year );
	if ( isNaN( monthNumber ) || isNaN( yearNumber ) ) {
		throw new Error( `Could not parse credit card date '${ cardExpiryDate }'` );
	}
	const currentYear = new Date().getFullYear();
	const currentMillenniumPrefix = Math.floor( currentYear / 100 );
	const fullYear = parseInt( `${ currentMillenniumPrefix }${ yearNumber }` );
	if ( isNaN( fullYear ) ) {
		throw new Error( `Could not parse credit card date '${ cardExpiryDate }'` );
	}
	// Note that the Date constructor expects the month to be 0 indexed, so 0
	// is January, but specifying a 0 as the day "underflows" and goes to the
	// last day of the previous month, which allows us to pass the wrong index
	// and get the right result.
	return new Date( fullYear, monthNumber, 0 );
}

export function creditCardExpiresBeforeSubscription( purchase: Purchase ): boolean {
	if ( 'credit_card' !== purchase.payment_type || ! purchase.payment_expiry ) {
		return false;
	}
	// For 100 years plans, the credit card will probably always expire before
	// the subscription so we should only consider this true if we are close to
	// the expiration date.
	if (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD &&
		! isCloseToExpiration( purchase )
	) {
		return false;
	}
	if (
		new Date( purchase.expiry_date ).getTime() >
		getDateFromCreditCardExpiry( purchase.payment_expiry ).getTime()
	) {
		return true;
	}
	return false;
}

export function creditCardHasAlreadyExpired( purchase: Purchase ): boolean {
	if ( 'credit_card' !== purchase.payment_type || ! purchase.payment_expiry ) {
		return false;
	}
	// For 100 years plans, the credit card will probably always expire before
	// the subscription so we should only consider this true if we are close to
	// the expiration date.
	if (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD &&
		! isCloseToExpiration( purchase )
	) {
		return false;
	}
	if ( new Date().getTime() > getDateFromCreditCardExpiry( purchase.payment_expiry ).getTime() ) {
		return true;
	}
	return false;
}

export function isAutoRenewEnabled( purchase: Purchase ): boolean {
	return parseInt( purchase.auto_renew ?? '' ) === 1;
}

export function isTransferredOwnership(
	purchaseId: string | number,
	transferredOwnershipPurchases: Purchase[]
): boolean {
	return transferredOwnershipPurchases.some(
		( purchase ) => String( purchase.ID ) === String( purchaseId )
	);
}

export function isA4ATemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.meta === 'is-a4a';
}

export function isAkismetTemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.product_type === 'akismet';
}

export function isMarketplaceTemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.product_type === 'saas_plugin';
}

export function isJetpackTemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.product_type === 'jetpack';
}
