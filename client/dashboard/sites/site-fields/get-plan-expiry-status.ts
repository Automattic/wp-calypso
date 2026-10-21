import { SubscriptionBillPeriod } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { getPlanExpiryUrgency } from '../../components/plan-expiry-notice';
import { formatDate, getCalendarDaysUntil } from '../../utils/datetime';
import { wpcomLink } from '../../utils/link';
import { getRenewalUrlFromPurchase } from '../../utils/purchase';
import {
	getExpiredRenewalTitle,
	getExpiringSoonCopy,
	getExpiringSoonRenewalTitle,
} from '../../utils/purchase-expiry-copy';
import { getSitePlanUpgradeUrl } from '../../utils/site-url';
import { isSitePlanTrial } from '../plans';
import type { Purchase, Site } from '@automattic/api-core';

export type PlanExpiryCta = 'renew' | 'upgrade';

export interface PlanExpiryStatus {
	intent: 'warning' | 'error';
	text: string;

	/** Renewal checkout, left out when the viewer is not the one who can renew. */
	href?: string;

	/** What `href` leads to, for the click event. Absent along with it. */
	cta?: PlanExpiryCta;

	/**
	 * Tooltip naming the expiry date, which the wording leaves out to keep the
	 * column short. Absent when we have no date to name.
	 */
	title?: string;

	/**
	 * Which stage this is, under the names `Expiry_Data::STATE_*` gives them in
	 * jetpack-mu-wpcom, so that this surface's events line up with the wp-admin
	 * banner's. The third state there, a plan past its grace period, never
	 * reaches here: the site is back on the free plan by then.
	 */
	state: 'approaching_expiry' | 'expired_grace';

	/**
	 * Days until expiry, negative once past it, as `days_remaining` counts them
	 * in wp-admin. Absent when the reader has no subscription to read a date
	 * from — see the comment on the purchase below.
	 */
	daysRemaining?: number;
}

function formatExpiryDate( purchase: Purchase, locale: string ): string {
	return formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } );
}

/**
 * Why an admin who is not the subscriber is being told about an expiry they
 * cannot act on. The same sentence the plans page and the wp-admin banner use,
 * so all three explain it the same way.
 */
function getNotTheSubscriberTitle(): string {
	return __(
		'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
	);
}

/** Tooltip for a lapsed plan, naming the date the wording leaves out. */
function getExpiredTitle( purchase: Purchase | undefined, locale: string ): string | undefined {
	if ( ! purchase ) {
		return undefined;
	}
	return getExpiredRenewalTitle( formatExpiryDate( purchase, locale ) ) ?? undefined;
}

/**
 * Where to send someone who wants their plan back, or `undefined` when renewing
 * it is not theirs to do.
 */
function getRenewUrl(
	site: Site,
	purchase?: Purchase
): { href: string; cta: PlanExpiryCta } | undefined {
	if ( ! site.plan?.user_is_owner ) {
		return undefined;
	}

	// A trial has no subscription to renew, so keeping the site's features
	// means buying a plan instead.
	if ( isSitePlanTrial( site ) ) {
		return { href: getSitePlanUpgradeUrl( site ), cta: 'upgrade' };
	}

	// Renewing from the subscription ID is the more precise route, but the
	// purchase may not have loaded yet — and for a plan that is still the site's
	// current one, checking out its product slug renews it just the same.
	return {
		href: purchase
			? getRenewalUrlFromPurchase( purchase )
			: wpcomLink( `/checkout/${ site.slug }/${ site.plan.product_slug }` ),
		cta: 'renew',
	};
}

/**
 * How to describe a site's plan alongside its name in the sites list, or null
 * for a plan that is renewing normally and has nothing to say for itself.
 *
 * `purchase` is the site's plan subscription, which only the subscriber has:
 * see `useSitePlanPurchase`.
 */
export function getPlanExpiryStatus(
	site: Site,
	purchase: Purchase | undefined,
	locale: string
): PlanExpiryStatus | null {
	// Past its expiry date but still the site's plan: the subscription is in
	// the grace period, where renewing restores everything. Taken from the site
	// rather than the subscription so that it shows for everyone who can see
	// the site, not only the subscriber who can act on it.
	if ( site.plan?.expired ) {
		const renewal = getRenewUrl( site, purchase );

		return {
			intent: 'error',
			text: __( 'Plan expired' ),
			href: renewal?.href,
			cta: renewal?.cta,
			title: renewal ? getExpiredTitle( purchase, locale ) : getNotTheSubscriberTitle(),
			state: 'expired_grace',
			daysRemaining: purchase
				? getCalendarDaysUntil( new Date( purchase.expiry_date ) )
				: undefined,
		};
	}

	// Everything below counts down to a date only the subscription carries, and
	// `/me/purchases` hands one over to nobody but its owner. A plan somebody
	// else pays for therefore shows its name alone until it actually lapses.
	if ( ! purchase ) {
		return null;
	}

	const urgency = getPlanExpiryUrgency( purchase );

	// `info` is the far-off end of the same scale — a date worth mentioning in a
	// notice, but not worth coloring a column over.
	if ( urgency !== 'warning' && urgency !== 'error' ) {
		return null;
	}

	// wp-admin holds a monthly plan to a 7-day notice window
	// (`Expiry_Data::MONTHLY_NOTICE_DAYS`), because a monthly term is shorter
	// than the 60-day annual window: warning on day 28 of a 31-day term would
	// mean warning for most of the plan's life. Let a sub-annual term reach the
	// error window before saying anything, so the two surfaces agree.
	if (
		urgency === 'warning' &&
		purchase.bill_period_days < SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD
	) {
		return null;
	}

	const copy = getExpiringSoonCopy( new Date( purchase.expiry_date ) );

	// Only reached in a locale that has yet to translate the day count. A color
	// with no wording says nothing, and an English sentence in a translated
	// column says the wrong thing, so the plan shows its name alone until the
	// translation lands. See `getExpiringSoonCopy`.
	if ( ! copy?.text ) {
		return null;
	}

	const expiryDate = formatExpiryDate( purchase, locale );

	return {
		intent: urgency,
		text: copy.text,
		href: getRenewalUrlFromPurchase( purchase ),
		cta: 'renew',
		title: getExpiringSoonRenewalTitle( expiryDate ) ?? expiryDate,
		state: 'approaching_expiry',
		daysRemaining: getCalendarDaysUntil( new Date( purchase.expiry_date ) ),
	};
}
