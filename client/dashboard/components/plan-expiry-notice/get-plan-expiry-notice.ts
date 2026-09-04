import { SubscriptionBillPeriod, getPlanNames } from '@automattic/api-core';
import { translationExists } from '@automattic/i18n-utils';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { formatDate, getCalendarDaysUntil, getRelativeDayString } from '../../utils/datetime';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import {
	EXPIRY_ERROR_DAYS,
	EXPIRY_WARNING_DAYS,
	getRenewalUrlFromPurchase,
	isDotcomPlan,
	isExpiredAndInGracePeriod,
	isRemoved,
	mightStillAutoRenew,
} from '../../utils/purchase';
import { getPlanStorageInGb } from './plan-storage';
import type { Purchase } from '@automattic/api-core';

export type PlanExpiryUrgency = 'info' | 'warning' | 'error';

/**
 * Days after the expiry date during which a lapsed plan can still be renewed
 * as it was. Mirrors `Expiry_Data::GRACE_PERIOD_DAYS` in jetpack-mu-wpcom.
 */
export const GRACE_PERIOD_DAYS = 30;

/**
 * Days after the grace period during which the sitewide notice still tells
 * the owner what happened. Mirrors `Expiry_Data::POST_GRACE_PERIOD_DAYS`.
 */
export const POST_GRACE_PERIOD_DAYS = 30;

export type PlanExpiryNoticeScope = 'purchase' | 'sitewide';

export type PlanExpiryNoticeStage = 'early-warning' | 'final-window' | 'grace' | 'post-grace';

export type PlanExpiryNoticeAction =
	| { type: 'renew'; label: string; href: string }
	| { type: 'view-other-plans'; label: string; href: string }
	| { type: 'enable-auto-renew'; label: string }
	| { type: 'add-payment-method'; label: string }
	| { type: 'restore-site'; label: string; href: string }
	| { type: 'contact-support'; label: string; message: string };

export interface PlanExpiryNoticeOptions {
	/**
	 * Where to send someone who would rather move to a different plan than renew
	 * this one. Each surface has to return to itself afterwards, so the caller
	 * builds this; the action is left out entirely when there is nowhere to send
	 * them.
	 */
	viewOtherPlansUrl?: string;

	/**
	 * The viewer's locale, for the expiration dates in the copy. Optional because
	 * callers that only ask whether a notice applies, or at what urgency, never
	 * read its text.
	 */
	locale?: string;

	/**
	 * Where renewal checkout returns to. Defaults to the dashboard page the user
	 * is on, so surfaces outside the dashboard have to say where they are.
	 */
	renewReturnUrl?: string;

	/**
	 * `purchase` (default) is the purchase-management notice: it may speak up
	 * months ahead and suggests turning auto-renew back on. `sitewide` mirrors
	 * the wp-admin banner: silent until 60 days out (7 for monthly plans), never
	 * offers auto-renew, and keeps talking for 30 days after the grace period.
	 */
	scope?: PlanExpiryNoticeScope;

	/**
	 * Sitewide scope only. Whether the site has already been reverted from
	 * Atomic to Simple, which changes the post-grace copy and sends the owner
	 * to support instead of checkout.
	 */
	isReverted?: boolean;
}

export interface PlanExpiryNoticeContent {
	variant: PlanExpiryUrgency;
	title?: string;
	body: string;

	/**
	 * Sitewide scope only. Which of the wp-admin banner's windows the notice is
	 * in.
	 */
	stage?: PlanExpiryNoticeStage;
	primaryAction?: PlanExpiryNoticeAction;
	secondaryAction?: PlanExpiryNoticeAction;
}

/**
 * A notice plus the source text of its title and body, so that we can tell
 * whether both have been translated yet before committing to showing it.
 */
interface ResolvedNotice extends PlanExpiryNoticeContent {
	title: string;
	titleSource: string;
	bodySource: string;
}

/**
 * Whether a purchase is eligible to show this component's notice, regardless of
 * whether it is actually showing under the current conditions. Use
 * {@link hasPlanExpiryNotice} to find out if the notice will be displayed.
 *
 * An eligible plan may intentionally have no plan-expiry notice under certain
 * conditions — for example, if it is renewing normally. The weaker, more
 * generic expiry notices that this one supersedes call this function to find
 * out if they should stay quiet too; their silence is this notice's decision,
 * not a gap to fill with a closely-related message.
 *
 * This function is also where the set of products the notice covers is
 * decided: in practice the first two checks below narrow it to Personal,
 * Premium, Business and Commerce, in every billing term. Trials, Jetpack, Woo,
 * Akismet, domains and the free plan are all excluded because they appear in
 * neither lookup. Adding a new plan tier means adding it to both.
 */
export function isEligibleForPlanExpiryNotice(
	purchase: Purchase,
	scope: PlanExpiryNoticeScope = 'purchase'
): boolean {
	return Boolean(
		// Names the plan for the copy, and covers exactly the four paid tiers.
		getPlanName( purchase ) &&
			// The copy always quotes a storage figure, so a plan we have no number
			// for cannot be described. Doubles as the same allowlist.
			getPlanStorageInGb( purchase.product_slug ) !== null &&
			// The copy is all about a site losing plan features, so require the
			// purchase to actually be a WordPress.com plan and not merely carry a
			// plan-shaped product slug.
			isDotcomPlan( purchase ) &&
			purchase.expiry_date &&
			// Agency- and host-managed plans can't be renewed by the customer.
			! purchase.partner_type &&
			// Removed subscriptions keep their existing "no longer in use" copy on
			// the purchase pages; the sitewide banner is the one place that still
			// talks about them, for a month after the grace period.
			( scope === 'sitewide' || ! isRemoved( purchase ) )
	);
}

/**
 * The plan purchase a site's expiry notice is about: the eligible WordPress.com
 * plan with the latest expiry date, so that a renewed plan hides the record of
 * the one it replaced. Mirrors `Expiry_Data::pick_primary_plan_purchase()`.
 */
export function pickSitewideExpiryPurchase( purchases: Purchase[] ): Purchase | null {
	return purchases
		.filter( ( purchase ) => isEligibleForPlanExpiryNotice( purchase, 'sitewide' ) )
		.reduce< Purchase | null >(
			( latest, purchase ) =>
				! latest || new Date( purchase.expiry_date ) > new Date( latest.expiry_date )
					? purchase
					: latest,
			null
		);
}

/**
 * Whether the notice will actually be displayed for this purchase right now.
 * Narrower than {@link isEligibleForPlanExpiryNotice}, which stays true for an
 * eligible plan even while there is nothing to say about it.
 *
 * Callers use this when only the presence of the notice matters, not what it
 * says: the purchase pages hide their own prominent buttons while it is up, so
 * that it is the only thing on the page asking the customer to act.
 */
export function hasPlanExpiryNotice( purchase: Purchase ): boolean {
	return getPlanExpiryNotice( purchase ) !== null;
}

/**
 * The urgency the notice would be shown at, or null if it would not be shown.
 *
 * The expiry date and auto-renew status displayed elsewhere on the purchase page
 * are colored from this, so that they agree with the notice when it makes sense
 * to color them at all.
 */
export function getPlanExpiryUrgency( purchase: Purchase ): PlanExpiryUrgency | null {
	return getPlanExpiryNotice( purchase )?.variant ?? null;
}

/**
 * Content for a notice about a WordPress.com plan that is approaching or past
 * its expiration date, or is otherwise at risk of not renewing. Returns null
 * when there is nothing worth saying.
 */
export function getPlanExpiryNotice(
	purchase: Purchase,
	options: PlanExpiryNoticeOptions = {}
): PlanExpiryNoticeContent | null {
	const scope = options.scope ?? 'purchase';

	if ( ! isEligibleForPlanExpiryNotice( purchase, scope ) ) {
		return null;
	}

	if ( scope === 'sitewide' ) {
		return resolveSitewideNotice( purchase, options );
	}

	const resolved = resolveNotice( purchase, options );
	if ( ! resolved ) {
		return null;
	}

	const { titleSource, bodySource, ...notice } = resolved;
	if ( translationExists( titleSource ) && translationExists( bodySource ) ) {
		return notice;
	}

	// The copy above hasn't been translated for this locale yet, so fall back
	// to the closest existing message for the same situation rather than
	// showing the reader English.
	if ( isExpiredAndInGracePeriod( purchase ) ) {
		return expiredFallbackNotice( notice.primaryAction );
	}

	// A plan that might still renew itself has no older message to fall back on:
	// the notices this one supersedes are gated on an expiry status it does not
	// have, so before this notice existed these purchases were told nothing.
	// Saying they will be removed would be worse than staying quiet.
	if ( mightStillAutoRenew( purchase ) ) {
		return null;
	}

	return notice.variant === 'info'
		? autoRenewOffFallbackNotice( purchase, notice.primaryAction )
		: expiringFallbackNotice( purchase, notice.primaryAction );
}

function resolveNotice(
	purchase: Purchase,
	{ viewOtherPlansUrl, locale, renewReturnUrl }: PlanExpiryNoticeOptions
): ResolvedNotice | null {
	const planName = getPlanName( purchase ) as string;
	const storageGb = getPlanStorageInGb( purchase.product_slug ) as number;
	const canAutoRenew = mightStillAutoRenew( purchase );
	const daysUntilExpiry = getCalendarDaysUntil( new Date( purchase.expiry_date ) );
	const expiryDate = formatDate( new Date( purchase.expiry_date ), locale ?? 'en', {
		dateStyle: 'long',
	} );
	const isAnnualOrLonger = purchase.bill_period_days >= SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD;

	const renewAction: PlanExpiryNoticeAction = {
		type: 'renew',
		label: __( 'Renew now' ),
		href: getRenewalUrlFromPurchase( purchase, renewReturnUrl ),
	};

	// Past the expiry date, still inside the grace period. Note that
	// `mightStillAutoRenew` is already false once the final auto-renewal
	// attempt has passed, so those purchases fall through to the "can't
	// auto-renew" wording on their own.
	if ( isExpiredAndInGracePeriod( purchase ) ) {
		return {
			variant: 'error',
			titleSource: 'Your %(planName)s plan has expired',
			// translators: %(planName)s is a short plan name, like "Business"
			title: sprintf( __( 'Your %(planName)s plan has expired' ), { planName } ),
			bodySource: canAutoRenew
				? 'If renewal doesn’t go through, your site will move to the Free plan. That means losing plugins, custom themes, and %(storageGb)d GB of storage. But it’s not too late. Renew now to keep your site as it is.'
				: 'Your site will move to the Free plan. That means losing plugins, custom themes, and %(storageGb)d GB of storage. But it’s not too late. Renew now to keep your site as it is.',
			body: canAutoRenew
				? sprintf(
						// translators: %(storageGb)d is a number of gigabytes of storage
						__(
							'If renewal doesn’t go through, your site will move to the Free plan. That means losing plugins, custom themes, and %(storageGb)d GB of storage. But it’s not too late. Renew now to keep your site as it is.'
						),
						{ storageGb }
				  )
				: sprintf(
						// translators: %(storageGb)d is a number of gigabytes of storage
						__(
							'Your site will move to the Free plan. That means losing plugins, custom themes, and %(storageGb)d GB of storage. But it’s not too late. Renew now to keep your site as it is.'
						),
						{ storageGb }
				  ),
			primaryAction: renewAction,
			// This label is new, so it may not be translated yet. Drop the action
			// rather than show one English button among translated copy; the primary
			// action is always there to fall back on.
			secondaryAction:
				viewOtherPlansUrl && translationExists( 'View other plans' )
					? { type: 'view-other-plans', label: __( 'View other plans' ), href: viewOtherPlansUrl }
					: undefined,
		};
	}

	// A monthly plan that is billing normally has nothing to warn about.
	if ( canAutoRenew && ! isAnnualOrLonger ) {
		return null;
	}

	// Close in, count the days exactly. `getRelativeDayString` would round a
	// month-and-change up to "in 1 month", which reads as far less urgent than
	// the 29 days it actually is.
	// The singular, because that is the key translations are stored under.
	const expiresInDaysTitleSource = 'Your %(planName)s plan expires in %(days)d day';
	const expiresInDaysTitle = sprintf(
		// translators: %(planName)s is a short plan name like "Business", and %(days)d is a number of days
		_n(
			'Your %(planName)s plan expires in %(days)d day',
			'Your %(planName)s plan expires in %(days)d days',
			daysUntilExpiry
		),
		{ planName, days: daysUntilExpiry }
	);

	const expiresTodayTitleSource = 'Your %(planName)s plan expires today';
	// translators: %(planName)s is a short plan name, like "Business"
	const expiresTodayTitle = sprintf( __( 'Your %(planName)s plan expires today' ), { planName } );

	const remainingTitleSource = 'Your %(planName)s plan has %(days)d day remaining';
	const remainingTitle = sprintf(
		// translators: %(planName)s is a short plan name like "Business", and %(days)d is a number of days
		_n(
			'Your %(planName)s plan has %(days)d day remaining',
			'Your %(planName)s plan has %(days)d days remaining',
			daysUntilExpiry
		),
		{ planName, days: daysUntilExpiry }
	);

	// The day of expiration, or the last few days before it.
	if ( daysUntilExpiry <= EXPIRY_ERROR_DAYS ) {
		const isExpiringToday = daysUntilExpiry <= 0;

		if ( canAutoRenew ) {
			return {
				variant: 'error',
				titleSource: isExpiringToday ? expiresTodayTitleSource : remainingTitleSource,
				title: isExpiringToday ? expiresTodayTitle : remainingTitle,
				bodySource:
					'If renewal doesn’t go through, your site will move to the Free plan and you’ll lose plugins, custom themes, and %(storageGb)d GB of storage. Renew now to keep everything in place.',
				body: sprintf(
					// translators: %(storageGb)d is a number of gigabytes of storage
					__(
						'If renewal doesn’t go through, your site will move to the Free plan and you’ll lose plugins, custom themes, and %(storageGb)d GB of storage. Renew now to keep everything in place.'
					),
					{ storageGb }
				),
				primaryAction: renewAction,
			};
		}

		return {
			variant: 'error',
			titleSource: isExpiringToday ? expiresTodayTitleSource : expiresInDaysTitleSource,
			title: isExpiringToday ? expiresTodayTitle : expiresInDaysTitle,
			bodySource: isExpiringToday
				? 'Unless you renew your plan, your site will move to the Free plan, and you’ll lose plugins, custom themes, and %(storageGb)d GB of storage. Renew now to keep everything in place.'
				: 'Your site will move to the Free plan and you’ll lose plugins, custom themes, and %(storageGb)d GB of storage. Renew now to keep everything in place.',
			body: isExpiringToday
				? sprintf(
						// translators: %(storageGb)d is a number of gigabytes of storage
						__(
							'Unless you renew your plan, your site will move to the Free plan, and you’ll lose plugins, custom themes, and %(storageGb)d GB of storage. Renew now to keep everything in place.'
						),
						{ storageGb }
				  )
				: sprintf(
						// translators: %(storageGb)d is a number of gigabytes of storage
						__(
							'Your site will move to the Free plan and you’ll lose plugins, custom themes, and %(storageGb)d GB of storage. Renew now to keep everything in place.'
						),
						{ storageGb }
				  ),
			primaryAction: renewAction,
		};
	}

	// A plan that can still auto-renew is only worth mentioning once its first
	// scheduled attempt has come and gone without renewing it.
	if ( canAutoRenew ) {
		if ( ! purchase.is_past_first_auto_renew_attempt_date ) {
			return null;
		}

		return {
			variant: 'warning',
			titleSource: remainingTitleSource,
			title: remainingTitle,
			bodySource:
				'If renewal doesn’t go through, your site will move to the Free plan, and you’ll lose access to plugins, custom themes, and %(storageGb)d GB of storage.',
			body: sprintf(
				// translators: %(storageGb)d is a number of gigabytes of storage
				__(
					'If renewal doesn’t go through, your site will move to the Free plan, and you’ll lose access to plugins, custom themes, and %(storageGb)d GB of storage.'
				),
				{ storageGb }
			),
			primaryAction: renewAction,
		};
	}

	if ( daysUntilExpiry <= EXPIRY_WARNING_DAYS ) {
		return {
			variant: 'warning',
			titleSource: expiresInDaysTitleSource,
			title: expiresInDaysTitle,
			bodySource:
				'After %(expiryDate)s, your site will move to the Free plan, which means you’ll lose access to plugins, custom themes, and %(storageGb)d GB of storage.',
			body: sprintf(
				// translators: %(expiryDate)s is a date like "August 15, 2026", and %(storageGb)d is a number of gigabytes of storage
				__(
					'After %(expiryDate)s, your site will move to the Free plan, which means you’ll lose access to plugins, custom themes, and %(storageGb)d GB of storage.'
				),
				{ expiryDate, storageGb }
			),
			// Renewing early only makes sense once expiration is close relative to
			// the billing period. A month is most of a monthly plan's cycle, so
			// paying again that far ahead would be premature; turning auto-renew
			// back on is the fix at this distance.
			primaryAction: isAnnualOrLonger ? renewAction : getTurnOnAutoRenewAction( purchase ),
		};
	}

	// Far enough out that months read more naturally than a day count.
	return {
		variant: 'info',
		titleSource: 'Your %(planName)s plan expires %(timeUntilExpiry)s',
		title: sprintf(
			// translators: %(planName)s is a short plan name like "Business", and %(timeUntilExpiry)s is a relative time like "in 3 months"
			__( 'Your %(planName)s plan expires %(timeUntilExpiry)s' ),
			{
				planName,
				timeUntilExpiry: getRelativeDayString( new Date( purchase.expiry_date ), 'upcoming' ),
			}
		),
		bodySource:
			'After %(expiryDate)s, your site will move to the Free plan, and you’ll lose access to plugins, custom themes, and %(storageGb)d GB of storage. Turn on auto-renew to keep everything in place.',
		body: sprintf(
			// translators: %(expiryDate)s is a date like "August 15, 2026", and %(storageGb)d is a number of gigabytes of storage
			__(
				'After %(expiryDate)s, your site will move to the Free plan, and you’ll lose access to plugins, custom themes, and %(storageGb)d GB of storage. Turn on auto-renew to keep everything in place.'
			),
			{ expiryDate, storageGb }
		),
		primaryAction: getTurnOnAutoRenewAction( purchase ),
	};
}

/**
 * The wp-admin banner's state machine, on top of the shared copy. Shows
 * English when a string is untranslated, as wp-admin does, rather than
 * falling back to the purchase pages' older messages.
 */
function resolveSitewideNotice(
	purchase: Purchase,
	options: PlanExpiryNoticeOptions
): PlanExpiryNoticeContent | null {
	const daysUntilExpiry = getCalendarDaysUntil( new Date( purchase.expiry_date ) );
	const isAnnualOrLonger = purchase.bill_period_days >= SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD;

	if ( daysUntilExpiry < 0 ) {
		const daysPastExpiry = -daysUntilExpiry;
		if ( daysPastExpiry >= GRACE_PERIOD_DAYS + POST_GRACE_PERIOD_DAYS ) {
			return null;
		}
		if ( daysPastExpiry >= GRACE_PERIOD_DAYS ) {
			return postGraceNotice( purchase, options );
		}
		// Inside the grace period the shared resolver already has the copy, but
		// it keys off the subscription status; a subscription removed early
		// still reads as grace here, going by the date like wp-admin does.
		const resolved = resolveNotice(
			{ ...purchase, expiry_status: 'expired', subscription_status: 'active' },
			options
		);
		return resolved ? withStage( resolved, 'grace' ) : null;
	}

	const noticeWindowDays = isAnnualOrLonger ? EXPIRY_WARNING_DAYS : EXPIRY_ERROR_DAYS;
	if ( daysUntilExpiry > noticeWindowDays ) {
		return null;
	}

	const resolved = resolveNotice( purchase, options );
	if ( ! resolved ) {
		return null;
	}

	return withStage(
		resolved,
		daysUntilExpiry > EXPIRY_ERROR_DAYS ? 'early-warning' : 'final-window'
	);
}

function withStage(
	resolved: ResolvedNotice,
	stage: PlanExpiryNoticeStage
): PlanExpiryNoticeContent {
	const { titleSource, bodySource, ...notice } = resolved;
	return { ...notice, stage };
}

function postGraceNotice(
	purchase: Purchase,
	{ isReverted, renewReturnUrl }: PlanExpiryNoticeOptions
): PlanExpiryNoticeContent {
	const planName = getPlanName( purchase ) as string;
	const storageGb = getPlanStorageInGb( purchase.product_slug ) as number;

	// translators: %(planName)s is a short plan name, like "Business"
	const title = sprintf( __( 'Your %(planName)s plan has expired' ), { planName } );

	if ( isReverted ) {
		return {
			variant: 'error',
			stage: 'post-grace',
			title,
			body: sprintf(
				// translators: %(storageGb)d is a number of gigabytes of storage
				__(
					'Your site has been moved to the Free plan and set to private. You no longer have access to plugins, custom themes, or %(storageGb)d GB of storage. Contact support to get help restoring it.'
				),
				{ storageGb }
			),
			primaryAction: {
				type: 'contact-support',
				label: __( 'Contact support' ),
				message: sprintf(
					// translators: %(planName)s is a short plan name, like "Business"
					__( 'My %(planName)s plan expired and I need your help getting it restored.' ),
					{ planName }
				),
			},
		};
	}

	return {
		variant: 'error',
		stage: 'post-grace',
		title,
		body: sprintf(
			// translators: %(storageGb)d is a number of gigabytes of storage
			__(
				'Your site has been moved to the Free plan. You no longer have access to plugins, custom themes, or %(storageGb)d GB of storage. Upgrade your plan to restore your site.'
			),
			{ storageGb }
		),
		primaryAction: {
			type: 'restore-site',
			label: __( 'Restore site' ),
			href: getRestoreUrl( purchase, renewReturnUrl ),
		},
	};
}

/**
 * A removed subscription cannot be renewed, so the way back is a fresh
 * purchase of the same plan. Matches the wp-admin banner's checkout link.
 */
function getRestoreUrl( purchase: Purchase, renewReturnUrl?: string ): string {
	const backUrl = renewReturnUrl ?? redirectToDashboardLink();
	return addQueryArgs(
		wpcomLink( `/checkout/${ purchase.site_slug }/${ purchase.product_slug }` ),
		{ cancel_to: backUrl, redirect_to: backUrl }
	);
}

function getPlanName( purchase: Purchase ): string | undefined {
	return ( getPlanNames() as Record< string, string | undefined > )[ purchase.product_slug ];
}

/**
 * Adding a payment method turns auto-renew on by itself, so both routes back
 * to a renewing plan share the same label.
 *
 * Which route applies turns on whether there is a chargeable payment method,
 * not on whether auto-renew is switched on: turning it on does nothing without
 * one, so a purchase with no method has to add one either way.
 */
function getTurnOnAutoRenewAction( purchase: Purchase ): PlanExpiryNoticeAction {
	const label = __( 'Turn on auto-renew' );

	return purchase.is_rechargeable
		? { type: 'enable-auto-renew', label }
		: { type: 'add-payment-method', label };
}

/**
 * Until the strings above are translated, say something the reader can
 * actually read: the closest existing message for the same situation.
 */
function expiredFallbackNotice( primaryAction?: PlanExpiryNoticeAction ): PlanExpiryNoticeContent {
	return {
		variant: 'error',
		body: translationExists(
			'This purchase has expired and will be removed soon unless it is renewed.'
		)
			? __( 'This purchase has expired and will be removed soon unless it is renewed.' )
			: __( 'This purchase has expired and is no longer in use.' ),
		primaryAction,
	};
}

function expiringFallbackNotice(
	purchase: Purchase,
	primaryAction?: PlanExpiryNoticeAction
): PlanExpiryNoticeContent {
	return {
		variant: 'warning',
		body: sprintf(
			// translators: %(purchaseName)s is the name of the plan and %(expiry)s is a relative time like "in 3 months"
			__( '%(purchaseName)s will expire and be removed from your site %(expiry)s.' ),
			{
				purchaseName: purchase.product_name,
				expiry: getRelativeDayString( new Date( purchase.expiry_date ), 'upcoming' ),
			}
		),
		primaryAction,
	};
}

/**
 * The calmest of the fallbacks, for a plan whose expiry is still some way off
 * and whose only problem is that auto-renew is switched off. Kept at `info` so
 * that falling back cannot leave the page more alarmed than the untranslated
 * copy would have been.
 */
function autoRenewOffFallbackNotice(
	purchase: Purchase,
	primaryAction?: PlanExpiryNoticeAction
): PlanExpiryNoticeContent {
	return {
		variant: 'info',
		body: sprintf(
			// translators: %(purchaseName)s is the name of the plan and %(expiry)s is a relative time like "in 3 months"
			__(
				'%(purchaseName)s will expire and be removed from your site %(expiry)s. Please enable auto-renewal so you don‘t lose out on your paid features!'
			),
			{
				purchaseName: purchase.product_name,
				expiry: getRelativeDayString( new Date( purchase.expiry_date ), 'upcoming' ),
			}
		),
		primaryAction,
	};
}
