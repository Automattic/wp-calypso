import { __, _n, sprintf } from '@wordpress/i18n';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';

export const PLAN_MONTHLY_PERIOD = 31;
export const PLAN_ANNUAL_PERIOD = 365;
export const PLAN_BIENNIAL_PERIOD = 730;
export const PLAN_TRIENNIAL_PERIOD = 1095;
export const PLAN_QUADRENNIAL_PERIOD = 1460;
export const PLAN_QUINQUENNIAL_PERIOD = 1825;
export const PLAN_SEXENNIAL_PERIOD = 2190;
export const PLAN_SEPTENNIAL_PERIOD = 2555;
export const PLAN_OCTENNIAL_PERIOD = 2920;
export const PLAN_NOVENNIAL_PERIOD = 3285;
export const PLAN_DECENNIAL_PERIOD = 3650;
export const PLAN_CENTENNIAL_PERIOD = 36500;

export const PRODUCT_AKISMET_FREE = 'ak_free_yearly';
export const PRODUCT_AKISMET_PERSONAL_MONTHLY = 'ak_personal_monthly';
export const PRODUCT_AKISMET_PERSONAL_YEARLY = 'ak_personal_yearly';
export const PRODUCT_AKISMET_PLUS_BI_YEARLY = 'ak_plus_bi_yearly_1';
export const PRODUCT_AKISMET_PLUS_YEARLY = 'ak_plus_yearly_1';
export const PRODUCT_AKISMET_PLUS_MONTHLY = 'ak_plus_monthly_1';
export const PRODUCT_AKISMET_PLUS_20K_BI_YEARLY = 'ak_plus_bi_yearly_2';
export const PRODUCT_AKISMET_PLUS_20K_YEARLY = 'ak_plus_yearly_2';
export const PRODUCT_AKISMET_PLUS_20K_MONTHLY = 'ak_plus_monthly_2';
export const PRODUCT_AKISMET_PLUS_30K_BI_YEARLY = 'ak_plus_bi_yearly_3';
export const PRODUCT_AKISMET_PLUS_30K_YEARLY = 'ak_plus_yearly_3';
export const PRODUCT_AKISMET_PLUS_30K_MONTHLY = 'ak_plus_monthly_3';
export const PRODUCT_AKISMET_PLUS_40K_BI_YEARLY = 'ak_plus_bi_yearly_4';
export const PRODUCT_AKISMET_PLUS_40K_YEARLY = 'ak_plus_yearly_4';
export const PRODUCT_AKISMET_PLUS_40K_MONTHLY = 'ak_plus_monthly_4';
export const PRODUCT_AKISMET_ENTERPRISE_BI_YEARLY = 'ak_ent_bi_yearly_1';
export const PRODUCT_AKISMET_ENTERPRISE_YEARLY = 'ak_ent_yearly_1';
export const PRODUCT_AKISMET_ENTERPRISE_MONTHLY = 'ak_ent_monthly_1';
export const PRODUCT_AKISMET_ENTERPRISE_350K_YEARLY = 'ak_ep350k_yearly_1';
export const PRODUCT_AKISMET_ENTERPRISE_350K_MONTHLY = 'ak_ep350k_monthly_1';
export const PRODUCT_AKISMET_ENTERPRISE_2M_YEARLY = 'ak_ep2m_yearly_1';
export const PRODUCT_AKISMET_ENTERPRISE_2M_MONTHLY = 'ak_ep2m_monthly_1';
export const PRODUCT_AKISMET_ENTERPRISE_GT2M_YEARLY = 'ak_epgt2m_yearly_1';
export const PRODUCT_AKISMET_ENTERPRISE_GT2M_MONTHLY = 'ak_epgt2m_monthly_1';
export const PRODUCT_AKISMET_PRO_500_MONTHLY = 'ak_pro5h_monthly';
export const PRODUCT_AKISMET_PRO_500_YEARLY = 'ak_pro5h_yearly';
export const PRODUCT_AKISMET_PRO_500_BI_YEARLY = 'ak_pro5h_bi_yearly';
export const PRODUCT_AKISMET_BUSINESS_5K_MONTHLY = 'ak_bus5k_monthly';
export const PRODUCT_AKISMET_BUSINESS_5K_YEARLY = 'ak_bus5k_yearly';
export const PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY = 'ak_bus5k_bi_yearly';
export const PRODUCT_AKISMET_ENTERPRISE_15K_MONTHLY = 'ak_ep15k_monthly';
export const PRODUCT_AKISMET_ENTERPRISE_15K_YEARLY = 'ak_ep15k_yearly';
export const PRODUCT_AKISMET_ENTERPRISE_15K_BI_YEARLY = 'ak_ep15k_bi_yearly';
export const PRODUCT_AKISMET_ENTERPRISE_25K_MONTHLY = 'ak_ep25k_monthly';
export const PRODUCT_AKISMET_ENTERPRISE_25K_YEARLY = 'ak_ep25k_yearly';
export const PRODUCT_AKISMET_ENTERPRISE_25K_BI_YEARLY = 'ak_ep25k_bi_yearly';

const msPerHour = 60 * 60 * 1000;
const msPerDay = 24 * msPerHour;

function getMsInUnit( unit: 'hours' | 'days' ): number {
	switch ( unit ) {
		case 'hours':
			return msPerHour;
		case 'days':
			return msPerDay;
		default:
			throw new Error(
				`Unknown unit '${ unit }'. Can only work with hours or days because other units (eg: months) are too vague.`
			);
	}
}

export function isWithinLast( date: Date, count: number, unit: 'hours' | 'days' ): boolean {
	const now = new Date();
	const difference = ( now.getTime() - date.getTime() ) / getMsInUnit( unit );
	return difference >= 0 && difference <= count;
}

export function isWithinNext( date: Date, count: number, unit: 'hours' | 'days' ): boolean {
	const now = new Date();
	const daysDifference = ( date.getTime() - now.getTime() ) / getMsInUnit( unit );
	return daysDifference >= 0 && daysDifference <= count;
}

export function getRelativeTimeString( date: Date ): string {
	const now = new Date();
	const isPast = date < now;

	const startDate = isPast ? date : now;
	const endDate = isPast ? now : date;

	// Calculate year difference
	let years = endDate.getFullYear() - startDate.getFullYear();
	let months = endDate.getMonth() - startDate.getMonth();
	let days = endDate.getDate() - startDate.getDate();

	// Adjust for negative days
	if ( days < 0 ) {
		months--;
		const lastMonth = new Date( endDate.getFullYear(), endDate.getMonth(), 0 );
		days += lastMonth.getDate();
	}

	// Adjust for negative months
	if ( months < 0 ) {
		years--;
		months += 12;
	}

	// Determine the most significant unit
	let value;
	let unit: 'year' | 'month' | 'day' | 'hour' | 'minute';

	if ( years > 0 ) {
		value = years;
		unit = 'year';
	} else if ( months > 0 ) {
		value = months;
		unit = 'month';
	} else if ( days > 0 ) {
		value = days;
		unit = 'day';
	} else {
		// For same day, fall back to hours/minutes
		const diffInMs = Math.abs( date.getTime() - now.getTime() );
		const hours = Math.floor( diffInMs / ( 60 * 60 * 1000 ) );
		const minutes = Math.floor( diffInMs / ( 60 * 1000 ) );

		if ( hours > 0 ) {
			value = hours;
			unit = 'hour';
		} else if ( minutes > 0 ) {
			value = minutes;
			unit = 'minute';
		} else {
			return __( 'just now' );
		}
	}

	// Return appropriate string
	if ( isPast ) {
		switch ( unit ) {
			case 'year':
				// translators: value is a number
				return sprintf( _n( '%(value)s year ago', '%(value)s years ago', value ), {
					value,
				} );
			case 'month':
				// translators: value is a number
				return sprintf( _n( '%(value)s month ago', '%(value)s months ago', value ), {
					value,
				} );
			case 'day':
				// translators: value is a number
				return sprintf( _n( '%(value)s day ago', '%(value)s days ago', value ), {
					value,
				} );
			case 'hour':
				// translators: value is a number
				return sprintf( _n( '%(value)s hour ago', '%(value)s hours ago', value ), {
					value,
				} );
			case 'minute':
				// translators: value is a number
				return sprintf( _n( '%(value)s minute ago', '%(value)s minutes ago', value ), {
					value,
				} );
			default:
				return __( 'just now' );
		}
	}
	switch ( unit ) {
		case 'year':
			// translators: value is a number
			return sprintf( _n( '%(value)s year from now', '%(value)s years from now', value ), {
				value,
			} );
		case 'month':
			// translators: value is a number
			return sprintf( _n( '%(value)s month from now', '%(value)s months from now', value ), {
				value,
			} );
		case 'day':
			// translators: value is a number
			return sprintf( _n( '%(value)s day from now', '%(value)s days from now', value ), {
				value,
			} );
		case 'hour':
			// translators: value is a number
			return sprintf( _n( '%(value)s hour from now', '%(value)s hours from now', value ), {
				value,
			} );
		case 'minute':
			// translators: value is a number
			return sprintf( _n( '%(value)s minute from now', '%(value)s minutes from now', value ), {
				value,
			} );
		default:
			return __( 'just now' );
	}
}

export function isTemporarySitePurchase( purchase: ActiveSubscription ): boolean {
	const { domain } = purchase;
	// Currently only Jetpack, Akismet, A4A, and some Marketplace products allow siteless/userless(license-based) purchases which require a temporary
	// site(s) to work. This function may need to be updated in the future as additional products types
	// incorporate siteless/userless(licensebased) product based purchases..
	return /^siteless\.(jetpack|akismet|marketplace\.wp|agencies\.automattic|a4a)\.com$/.test(
		domain
	);
}

export function isRenewing( purchase: ActiveSubscription ): boolean {
	return [ 'active', 'auto-renewing' ].includes( purchase.expiry_status );
}

export function isExpiring( purchase: ActiveSubscription ) {
	return [ 'manual-renew', 'expiring' ].includes( purchase.expiry_status );
}

export function isExpired( purchase: ActiveSubscription ) {
	return 'expired' === purchase.expiry_status;
}

export function isIncludedWithPlan( purchase: ActiveSubscription ) {
	return 'included' === purchase.expiry_status;
}

export function isOneTimePurchase( purchase: ActiveSubscription ) {
	return 'one-time-purchase' === purchase.expiry_status;
}

// AKISMET_ENTERPRISE_YEARLY has a $0 plan for nonprofits, so we need to check the amount
// to determine if it's free or not.
export function isAkismetFreeProduct( product: ActiveSubscription ): boolean {
	return (
		PRODUCT_AKISMET_FREE === product.product_slug ||
		( PRODUCT_AKISMET_ENTERPRISE_YEARLY === product.product_slug && product.amount === 0 )
	);
}

/**
 * Determines if this is a recent monthly purchase (bought within the past week).
 *
 * This is often used to ensure that notices about purchases which expire
 * "soon" are not displayed with error styling to a user who just purchased a
 * monthly subscription (which by definition will expire relatively soon).
 */
export function isRecentMonthlyPurchase( purchase: ActiveSubscription ): boolean {
	return Boolean(
		purchase.subscribed_date &&
			isWithinLast( new Date( purchase.subscribed_date ), 7, 'days' ) &&
			purchase.bill_period_days === PLAN_MONTHLY_PERIOD
	);
}

/**
 * Returns true for purchases that are expired or expiring/renewing soon.
 *
 * The latter is defined as within one month of expiration for monthly
 * subscriptions (i.e., one billing period) and within three months of
 * expiration for everything else.
 */
export function isCloseToExpiration( purchase: ActiveSubscription ): boolean {
	if ( ! purchase.expiry_date ) {
		return false;
	}
	const threshold =
		purchase.bill_period_days === PLAN_MONTHLY_PERIOD
			? PLAN_MONTHLY_PERIOD
			: PLAN_MONTHLY_PERIOD * 3;
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

export function creditCardExpiresBeforeSubscription( purchase: ActiveSubscription ): boolean {
	if ( 'credit_card' !== purchase.payment_type || ! purchase.payment_expiry ) {
		return false;
	}
	// For 100 years plans, the credit card will probably always expire before
	// the subscription so we should only consider this true if we are close to
	// the expiration date.
	if ( purchase.bill_period_days === PLAN_CENTENNIAL_PERIOD && ! isCloseToExpiration( purchase ) ) {
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

export function creditCardHasAlreadyExpired( purchase: ActiveSubscription ): boolean {
	if ( 'credit_card' !== purchase.payment_type || ! purchase.payment_expiry ) {
		return false;
	}
	// For 100 years plans, the credit card will probably always expire before
	// the subscription so we should only consider this true if we are close to
	// the expiration date.
	if ( purchase.bill_period_days === PLAN_CENTENNIAL_PERIOD && ! isCloseToExpiration( purchase ) ) {
		return false;
	}
	if ( new Date().getTime() > getDateFromCreditCardExpiry( purchase.payment_expiry ).getTime() ) {
		return true;
	}
	return false;
}

export function isAutoRenewEnabled( purchase: ActiveSubscription ): boolean {
	return parseInt( purchase.auto_renew ?? '' ) === 1;
}
