import { SubscriptionBillPeriod } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import type { SitePlanData } from 'calypso/state/sites/plans/types';
import type { LocalizeProps, TranslateResult } from 'i18n-calypso';

export const isScheduledTermChangeEnabled = () => config.isEnabled( 'plans/scheduled-term-change' );

/**
 * The number of months in a site plan's billing period, from the `interval`
 * the plans endpoint reports, or null when it doesn't report one.
 */
export function getSitePlanTermMonths( sitePlan: SitePlanData | null | undefined ): number | null {
	const interval = sitePlan?.interval;
	if ( ! interval || ! Number.isFinite( interval ) || interval <= 0 ) {
		return null;
	}
	if ( interval === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD ) {
		return 1;
	}
	return Math.round( interval / SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD ) * 12;
}

/**
 * Whether the target plan bills on a shorter term than the current one, such as
 * Premium monthly from Premium annual, or Business monthly from Premium annual.
 * The server only allows these as changes scheduled for the current plan's renewal.
 */
export function isShorterTermPlanChange(
	currentSitePlan: SitePlanData | null | undefined,
	targetSitePlan: SitePlanData | null | undefined
): boolean {
	const currentMonths = getSitePlanTermMonths( currentSitePlan );
	const targetMonths = getSitePlanTermMonths( targetSitePlan );
	return currentMonths !== null && targetMonths !== null && targetMonths < currentMonths;
}

/**
 * Whether the server allows moving to this plan only at the current plan's
 * renewal, so it must go through the delayed-downgrade flow even while the
 * current plan could otherwise be downgraded instantly.
 */
export function isScheduledOnlyPlanChange( targetSitePlan: SitePlanData | null | undefined ) {
	return (
		!! targetSitePlan?.availableForDowngrade &&
		!! targetSitePlan.isDelayedDowngradeAvailable &&
		! targetSitePlan.isInstantDowngradeAvailable
	);
}

/**
 * The site plan's name with its billing term, e.g. "WordPress.com Premium
 * (monthly)", to tell two terms of the same plan apart.
 */
export function getSitePlanNameWithTerm(
	sitePlan: SitePlanData,
	translate: LocalizeProps[ 'translate' ]
): TranslateResult {
	const args = { plan: sitePlan.productName };
	switch ( sitePlan.interval ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			return translate( '%(plan)s (monthly)', {
				args,
				comment: '%(plan)s is a plan name, e.g. "WordPress.com Premium"',
			} );
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			return translate( '%(plan)s (yearly)', {
				args,
				comment: '%(plan)s is a plan name, e.g. "WordPress.com Premium"',
			} );
		case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
			return translate( '%(plan)s (2 years)', {
				args,
				comment: '%(plan)s is a plan name, e.g. "WordPress.com Premium"',
			} );
		case SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD:
			return translate( '%(plan)s (3 years)', {
				args,
				comment: '%(plan)s is a plan name, e.g. "WordPress.com Premium"',
			} );
		default:
			return sitePlan.productName;
	}
}

/**
 * What renewing onto the site plan will charge, with its billing term, e.g.
 * "$8/month", or null for a term without a label. The renewal is priced at the
 * plan's original cost, before any sale or upgrade credit `raw_price` reflects.
 */
export function getSitePlanRenewalPriceWithTerm(
	sitePlan: SitePlanData,
	formatPrice: ( amountInSmallestUnit: number, currencyCode: string ) => string,
	translate: LocalizeProps[ 'translate' ]
): TranslateResult | null {
	const args = {
		price: formatPrice(
			sitePlan.rawPriceInteger + ( sitePlan.rawDiscountInteger ?? 0 ),
			sitePlan.currencyCode
		),
	};
	switch ( sitePlan.interval ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			return translate( '%(price)s/month', {
				args,
				comment: '%(price)s is a formatted price, e.g. "$8"',
			} );
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			return translate( '%(price)s/year', {
				args,
				comment: '%(price)s is a formatted price, e.g. "$8"',
			} );
		case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
			return translate( '%(price)s every two years', {
				args,
				comment: '%(price)s is a formatted price, e.g. "$8"',
			} );
		case SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD:
			return translate( '%(price)s every three years', {
				args,
				comment: '%(price)s is a formatted price, e.g. "$8"',
			} );
		default:
			return null;
	}
}
