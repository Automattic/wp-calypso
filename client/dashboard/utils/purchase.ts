import {
	AkismetPlans,
	DomainProductSlugs,
	JetpackPlans,
	GoogleWorkspaceSlugs,
	JetpackSearchProducts,
	PRODUCT_1GB_SPACE,
	SubscriptionBillPeriod,
	TitanMailSlugs,
	WPCOM_DIFM_LITE,
	OFFSITE_REDIRECT,
} from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { isAfter, parseISO, startOfDay } from 'date-fns';
import { isAkismetPro500Plan } from './akismet';
import { isWithinLast, isWithinNext, getDateFromCreditCardExpiry } from './datetime';
import { isGSuiteProductSlug } from './gsuite';
import { redirectToDashboardLink, wpcomLink } from './link';
import { encodeProductForUrl } from './wpcom-checkout';
import type { Product, Purchase } from '@automattic/api-core';

export const CANCEL_FLOW_TYPE = {
	REMOVE: 'remove',
	CANCEL_WITH_REFUND: 'cancel_with_refund',

	// When users effectively cancelling the auto-renewal by
	// cancelling a subscription out of the refund window
	CANCEL_AUTORENEW: 'cancel_autorenew',
} as const;
export type CancelFlowType = ( typeof CANCEL_FLOW_TYPE )[ keyof typeof CANCEL_FLOW_TYPE ];

/**
 * Returns true if the purchase is auto-renewing and not yet expired.
 */
export function isRenewingBeforeExpiration( purchase: Purchase ): boolean {
	return [ 'active', 'auto-renewing' ].includes( purchase.expiry_status );
}

/**
 * Returns true if the purchase is still active but will lapse unless renewed,
 * because it is not set to auto-renew. Covers an `expiry_status` of either
 * `manual-renew` (not auto-renewing, with the expiry date not yet imminent) or
 * `expiring` (not auto-renewing and expiring soon — the "needs attention"
 * state).
 *
 * Note this describes a purchase that has not yet passed its expiry date — once
 * the expiry date passes without renewal the status becomes `expired` (see
 * {@link isExpiredAndInGracePeriod} and {@link isRemoved}).
 */
export function isExpiring( purchase: Purchase ) {
	return [ 'manual-renew', 'expiring' ].includes( purchase.expiry_status );
}

/**
 * Returns true if the purchase has passed its expiration date but is still
 * active — this covers the post-expiry grace period during which a
 * subscription can still be renewed before being fully removed.
 *
 * If you also want to know whether the purchase could still have upcoming
 * AUTO-RENEW attempts (which can occur even during the grace period), see
 * {@link mightStillAutoRenew} or {@link isExpiredWithNoAutoRenewAttemptsLeft}.
 *
 * Note that during the grace period, the `purchase.renew_date` property may be
 * empty even for subscriptions that auto-renew (this happens once the final
 * auto-renewal attempt has passed), but regardless of whether it's empty, the
 * focus of the user interface during this phase should not be on showing
 * scheduled auto-renewal dates (which aren't very likely to succeed at this
 * point anyway) but rather on encouraging the customer to manually renew.
 */
export function isExpiredAndInGracePeriod( purchase: Purchase ): boolean {
	return 'expired' === purchase.expiry_status && 'active' === purchase.subscription_status;
}

/**
 * Returns true if the purchase's subscription is no longer active (removed).
 */
export function isRemoved( purchase: Purchase ): boolean {
	return 'active' !== purchase.subscription_status;
}

/**
 * Convenience check for "expired in any way" — either still active but past the
 * expiration date (grace period), or fully removed.
 */
export function isExpiredOrRemoved( purchase: Purchase ): boolean {
	return isExpiredAndInGracePeriod( purchase ) || isRemoved( purchase );
}

/**
 * Returns true if the purchase may still auto-renew — i.e. a charge will
 * actually be attempted: the subscription is active, auto-renew is enabled, a
 * rechargeable payment method is attached, and it is not past its final
 * auto-renewal attempt date.
 *
 * This is the "will be billed" signal and is a superset of the renewing
 * `expiry_status` values (`active`/`auto-renewing` already require a chargeable
 * payment method on the backend), so it holds for both not-yet-expired
 * auto-renewing purchases and grace-period purchases that may still recover.
 * "Might" is intentional: the underlying dates are day-granular and a charge can
 * still fail.
 */
export function mightStillAutoRenew( purchase: Purchase ): boolean {
	return purchase.might_still_auto_renew;
}

/**
 * Returns true if the purchase has passed its expiry date (and is still in its
 * grace period, not removed) with no remaining auto-renewal attempts on the
 * schedule. This is the "expired and the auto-renew schedule is exhausted"
 * state, independent of whether auto-renew is currently enabled or a payment
 * method is attached.
 *
 * If this returns false, then there is still hope -- even if the purchase has
 * auto-renew turned off or doesn't have a chargeable payment method attached,
 * those are things which can be fixed and still end up with a successful
 * auto-renewal in the end. Therefore, this is useful to check when deciding
 * whether to allow the customer to do things like add a payment method or
 * enable auto-renew on an already-expired subscription.
 */
export function isExpiredWithNoAutoRenewAttemptsLeft( purchase: Purchase ): boolean {
	return isExpiredAndInGracePeriod( purchase ) && purchase.is_past_last_auto_renew_attempt_date;
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

export function isAkismetProduct( product: Purchase ): boolean {
	return Object.values( AkismetPlans ).includes(
		product.product_slug as ( typeof AkismetPlans )[ keyof typeof AkismetPlans ]
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

export function creditCardExpiresBeforeSubscription( purchase: Purchase ): boolean {
	if ( 'credit_card' !== purchase.payment_type ) {
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

	// Use payment_expiry_date if available for more accurate expiry checking
	if ( purchase.payment_expiry_date ) {
		// Both dates are in UTC (YYYY-MM-DD format), parse and compare them
		return isAfter( parseISO( purchase.expiry_date ), parseISO( purchase.payment_expiry_date ) );
	}

	// Fall back to payment_expiry for backward compatibility
	if ( ! purchase.payment_expiry ) {
		return false;
	}
	return isAfter(
		parseISO( purchase.expiry_date ),
		getDateFromCreditCardExpiry( purchase.payment_expiry )
	);
}

export function creditCardHasAlreadyExpired( purchase: Purchase ): boolean {
	if ( 'credit_card' !== purchase.payment_type ) {
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

	// Use payment_expiry_date if available for more accurate expiry checking
	if ( purchase.payment_expiry_date ) {
		// Compare current UTC date with payment expiry date (both YYYY-MM-DD in UTC)
		return isAfter( startOfDay( new Date() ), parseISO( purchase.payment_expiry_date ) );
	}

	// Fall back to payment_expiry for backward compatibility
	if ( ! purchase.payment_expiry ) {
		return false;
	}
	return isAfter(
		startOfDay( new Date() ),
		getDateFromCreditCardExpiry( purchase.payment_expiry )
	);
}

export function isTransferredOwnership(
	purchaseId: string | number,
	transferredOwnershipPurchases: Purchase[]
): boolean {
	return transferredOwnershipPurchases.some(
		( purchase ) => String( purchase.ID ) === String( purchaseId )
	);
}

export function isA4ABillingDragonPurchase( purchase: Purchase ): boolean {
	return purchase.meta === 'is-a4a';
}

export function isA4AHoldingSitePurchase( purchase: Purchase ): boolean {
	return purchase.is_attached_to_holding_site && isA4ABillingDragonPurchase( purchase );
}

export function isAkismetHoldingSitePurchase( purchase: Purchase ): boolean {
	return purchase.is_attached_to_holding_site && purchase.product_type === 'akismet';
}

export function isMarketplacePlugin( purchase: Purchase ): boolean {
	return (
		purchase.product_type.startsWith( 'marketplace' ) || purchase.product_type === 'saas_plugin'
	);
}

export function isMarketplaceHoldingSitePurchase( purchase: Purchase ): boolean {
	return purchase.is_attached_to_holding_site && purchase.product_type === 'saas_plugin';
}

export function isJetpackHoldingSitePurchase( purchase: Purchase ): boolean {
	return purchase.is_attached_to_holding_site && purchase.product_type === 'jetpack';
}

/**
 * Return the bill period as a sentence case string. Note that Purchae includes
 * this text already as `bill_period_label` but it is not sentence case and has
 * no punctuation.
 */
export function getBillPeriodLabel( purchase: Purchase ): string {
	switch ( purchase.bill_period_days ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			return __( 'Per month.' );
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			return __( 'Per year.' );
		case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
			return __( 'Every two years.' );
		case SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD:
			return __( 'Every three years.' );
		case SubscriptionBillPeriod.PLAN_QUADRENNIAL_PERIOD:
			return __( 'Every four years.' );
		case SubscriptionBillPeriod.PLAN_QUINQUENNIAL_PERIOD:
			return __( 'Every five years.' );
		case SubscriptionBillPeriod.PLAN_SEXENNIAL_PERIOD:
			return __( 'Every six years.' );
		case SubscriptionBillPeriod.PLAN_SEPTENNIAL_PERIOD:
			return __( 'Every seven years.' );
		case SubscriptionBillPeriod.PLAN_OCTENNIAL_PERIOD:
			return __( 'Every eight years.' );
		case SubscriptionBillPeriod.PLAN_NOVENNIAL_PERIOD:
			return __( 'Every nine years.' );
		case SubscriptionBillPeriod.PLAN_DECENNIAL_PERIOD:
			return __( 'Every ten years.' );
		case SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD:
			return __( 'Every hundred years.' );
		default:
			return purchase.bill_period_label;
	}
}

/**
 * Return the title for a purchase for display.
 *
 * Usually this is just the `product_name`, but some products are displayed
 * differently. For example, domains are displayed with the domain name as the
 * title and the product name as the subtitle (see `getSubtitleForDisplay`).
 */
export function getTitleForDisplay( purchase: Purchase ): string {
	if ( purchase.is_hundred_year_domain ) {
		return __( '100-Year Domain Registration' );
	}

	if (
		purchase.is_jetpack_ai_product &&
		purchase.renewal_price_tier_usage_quantity &&
		purchase.price_tier_list?.length
	) {
		// translators: productName is the name of the product and quantity is a number
		return sprintf( __( '%(productName)s (%(quantity)s requests per month)' ), {
			productName: purchase.product_name,
			quantity: formatNumber( purchase.renewal_price_tier_usage_quantity ),
		} );
	}

	if (
		purchase.is_jetpack_stats_product &&
		! purchase.is_free_jetpack_stats_product &&
		purchase.renewal_price_tier_usage_quantity &&
		purchase.price_tier_list?.length
	) {
		// translators: productName is the name of the product and quantity is a number
		return sprintf( __( '%(productName)s (%(quantity)s views per month)' ), {
			productName: purchase.product_name,
			quantity: formatNumber( purchase.renewal_price_tier_usage_quantity ),
		} );
	}

	if (
		'wordpress_com_1gb_space_addon_yearly' === purchase.product_slug &&
		purchase.renewal_price_tier_usage_quantity
	) {
		// translators: %(productName)s is the name of the product and %(quantity)s is a number (GB stands for GigaBytes)
		return sprintf( __( '%(productName)s %(quantity)s GB' ), {
			productName: purchase.product_name,
			quantity: String( purchase.renewal_price_tier_usage_quantity ),
		} );
	}

	if ( purchase.meta && ( purchase.is_domain_registration || purchase.is_domain ) ) {
		return purchase.meta;
	}

	if (
		isAkismetPro500Plan( purchase.product_slug ) &&
		purchase.renewal_price_tier_usage_quantity &&
		purchase.renewal_price_tier_usage_quantity > 1
	) {
		/* translators: %(productName)s is the product name "Akismet Pro", %(requests)d is a number of requests/month */
		return sprintf( __( '%(productName)s (%(requests)d requests/month)' ), {
			productName: purchase.product_name.replace( /\s*\(.*$/, '' ).trim(),
			requests: 500 * purchase.renewal_price_tier_usage_quantity,
		} );
	}

	if ( purchase.is_plan ) {
		/* translators: %(productName)s is the product name "WordPress.com Personal" */
		return sprintf( __( '%(productName)s Plan' ), {
			productName: purchase.product_name.replace( /\s*\(.*$/, '' ).trim(),
		} );
	}

	return purchase.product_name;
}

export function getTitleForListDisplay( purchase: Purchase ): string {
	if ( purchase.is_domain_registration && purchase.meta ) {
		if ( purchase.is_hundred_year_domain ) {
			// translators: %s is the domain name, e.g. "100-Year Domain Registration: example.com"
			return sprintf( __( '100-Year Domain Registration: %s' ), purchase.meta );
		}
		// translators: %s is the domain name, e.g. "Domain Registration: example.com"
		return sprintf( __( 'Domain Registration: %s' ), purchase.meta );
	}
	return getTitleForDisplay( purchase );
}

/**
 * Return a short description of a purchase, usually used as a subtitle for that
 * purchase's product name (as defined by `getTitleForDisplay`).
 *
 * Notably, domains typically have their title as the domain name itself and
 * the product type as the subtitle.
 */
export function getSubtitleForDisplay( purchase: Purchase ): string | null {
	if ( 'theme' === purchase.product_type ) {
		return __( 'Premium Theme' );
	}

	if ( 'concierge-session' === purchase.product_slug ) {
		return __( 'One-on-one Support' );
	}

	if ( purchase.partner_name ) {
		if ( purchase.partner_type && [ 'agency', 'a4a_agency' ].includes( purchase.partner_type ) ) {
			return __( 'Agency Managed Plan' );
		}

		return __( 'Host Managed Plan' );
	}

	if ( purchase.is_plan ) {
		return null;
	}

	if ( purchase.is_domain_registration ) {
		return purchase.product_name;
	}

	if ( purchase.product_slug === 'domain_map' ) {
		return purchase.product_name;
	}

	if ( purchase.is_attached_to_holding_site && purchase.product_type === 'akismet' ) {
		return null;
	}

	if ( purchase.is_attached_to_holding_site && purchase.product_type === 'saas_plugin' ) {
		return null;
	}

	if ( purchase.is_attached_to_holding_site && isA4AHoldingSitePurchase( purchase ) ) {
		return null;
	}

	if ( purchase.is_google_workspace_product && purchase.meta ) {
		return sprintf(
			// translators: %(domain)s is the domain name of the site
			__( 'Mailboxes and Productivity Tools at %(domain)s' ),
			{
				domain: purchase.meta,
			}
		);
	}

	if ( purchase.is_titan_mail_product && purchase.meta ) {
		return sprintf(
			// translators: %(domain)s is the domain name of the site
			__( 'Mailboxes at %(domain)s' ),
			{
				domain: purchase.meta,
			}
		);
	}

	if ( purchase.product_type === 'marketplace_plugin' || purchase.product_type === 'saas_plugin' ) {
		return __( 'Plugin' );
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}

export function isJetpackCrmProduct( keyOrSlug: string ): boolean {
	return (
		keyOrSlug.startsWith( 'jetpack-complete' ) ||
		keyOrSlug.startsWith( 'jetpack_complete' ) ||
		keyOrSlug.startsWith( 'jetpack-crm' ) ||
		keyOrSlug.startsWith( 'jetpack_crm' )
	);
}

type ObjectWithProductSlug = { product_slug?: string };

export function isTitanMail( purchase: Purchase | ObjectWithProductSlug ): boolean {
	if ( ! purchase.product_slug ) {
		return false;
	}

	return ( Object.values( TitanMailSlugs ) as readonly string[] ).includes( purchase.product_slug );
}

export function isGoogleWorkspace( purchase: Purchase | ObjectWithProductSlug ): boolean {
	return (
		purchase.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY ||
		purchase.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
	);
}

export function isDomainTransfer( purchase: Purchase | ObjectWithProductSlug ): boolean {
	return purchase.product_slug === DomainProductSlugs.TRANSFER_IN;
}

export function isSiteRedirect( purchase: Purchase ): boolean {
	return purchase.product_slug === OFFSITE_REDIRECT;
}

export function isWpcomFlexSubscription( purchase: Purchase ): boolean {
	return purchase.product_slug === 'flex-hosting-plan-monthly';
}

/**
 * Checks if a product is a DIFM (Do It For Me) product.
 */
export function isDIFMProduct( product: ObjectWithProductSlug ): boolean {
	return product.product_slug === WPCOM_DIFM_LITE;
}

/**
 * Checks if a product is a tiered volume space addon.
 */
export function isTieredVolumeSpaceAddon( product: ObjectWithProductSlug ): boolean {
	return product.product_slug === PRODUCT_1GB_SPACE;
}

const SPACE_UPGRADE_SLUGS = [
	'1gb_space_upgrade',
	'5gb_space_upgrade',
	'10gb_space_upgrade',
	'50gb_space_upgrade',
	'100gb_space_upgrade',
];

export function isStorageUpgrade( purchase: Purchase ): boolean {
	return (
		SPACE_UPGRADE_SLUGS.includes( purchase.product_slug ) || isTieredVolumeSpaceAddon( purchase )
	);
}

/**
 * Checks if a product is a Jetpack Search product.
 */
export function isJetpackSearch( product: ObjectWithProductSlug ): boolean {
	return product.product_slug
		? Object.keys( JetpackSearchProducts ).includes( product.product_slug )
		: false;
}

const JETPACK_STATS_PAID_PRODUCT_SLUGS = [
	'jetpack_stats_bi_yearly',
	'jetpack_stats_yearly',
	'jetpack_stats_monthly',
	'jetpack_stats_pwyw_yearly',
] as const;

/**
 * Checks if a product slug is a paid Jetpack Stats product.
 */
export function isJetpackStatsPaidProductSlug( productSlug: string | undefined ): boolean {
	return productSlug
		? ( JETPACK_STATS_PAID_PRODUCT_SLUGS as readonly string[] ).includes( productSlug )
		: false;
}

export function isJetpackT1SecurityPlan( purchase: Purchase ): boolean {
	const securityT1Slugs = [
		JetpackPlans.PLAN_JETPACK_SECURITY_T1_YEARLY,
		JetpackPlans.PLAN_JETPACK_SECURITY_T1_MONTHLY,
		JetpackPlans.PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	] as const;
	return securityT1Slugs.includes( purchase.product_slug as ( typeof securityT1Slugs )[ number ] );
}

export function isDotcomPlan( purchase: Purchase ): boolean {
	return purchase.is_plan && ! purchase.is_jetpack_plan_or_product;
}

function getServicePathForCheckoutFromPurchase( purchase: Purchase ): string {
	if ( isAkismetProduct( purchase ) ) {
		return 'akismet/';
	}
	if ( isMarketplaceHoldingSitePurchase( purchase ) ) {
		return 'marketplace/';
	}
	return '';
}

function getCheckoutProductSlugFromPurchase( purchase: Purchase ): string {
	const productSlug = encodeProductForUrl( purchase.product_slug );
	const productDomain = purchase.meta ? encodeProductForUrl( purchase.meta ) : undefined;
	const checkoutProductSlug = productDomain ? `${ productSlug }:${ productDomain }` : productSlug;
	return checkoutProductSlug;
}

function getCheckoutSiteSlugForPurchase( purchase: Purchase ): string {
	if ( isAkismetProduct( purchase ) ) {
		// Akismet checkout never uses a site slug.
		return '';
	}
	return purchase.site_slug || '';
}

export function getRenewalUrlFromPurchase(
	purchase: Purchase,
	checkoutSiteSlugForUrl?: string
): string {
	return getRenewUrlForPurchases( [ purchase ], checkoutSiteSlugForUrl );
}

export function getRenewUrlForPurchases(
	purchases: Purchase[],
	checkoutSiteSlugForUrl?: string
): string {
	if ( purchases.length < 1 ) {
		throw new Error( 'Could not find product slug or purchase id for renewal.' );
	}
	const firstPurchase = purchases[ 0 ];
	const checkoutProductSlug = purchases
		.map( ( purchase ) => getCheckoutProductSlugFromPurchase( purchase ) )
		.join( ',' );
	const checkoutSiteSlug =
		checkoutSiteSlugForUrl || getCheckoutSiteSlugForPurchase( firstPurchase );
	const servicePath = getServicePathForCheckoutFromPurchase( firstPurchase );
	const purchaseIds = purchases.map( ( purchase ) => purchase.ID ).join( ',' );
	const backUrl = redirectToDashboardLink();
	return addQueryArgs(
		wpcomLink(
			`/checkout/${ servicePath }${ checkoutProductSlug }/renew/${ purchaseIds }/${ checkoutSiteSlug }`
		),
		{
			cancel_to: backUrl,
			redirect_to: backUrl,
		}
	);
}

/**
 * Determines if the purchase needs to renew soon.
 *
 * This will return true if the purchase is either already expired or
 * expiring/renewing soon.
 *
 * The intention here is to identify purchases that the user might reasonably
 * want to manually renew (regardless of whether they are also scheduled to
 * auto-renew).
 */
export function needsToRenewSoon( purchase: Purchase ): boolean {
	// Skip purchases that never need to renew or that can't be renewed.
	if (
		isOneTimePurchase( purchase ) ||
		purchase.partner_type ||
		! purchase.is_renewable ||
		! purchase.can_explicit_renew
	) {
		return false;
	}
	// Include purchases past expiry (grace period) that are still renewable
	const isPastExpiry = new Date( purchase.expiry_date ) < new Date();
	return isCloseToExpiration( purchase ) || isPastExpiry;
}

export function isPartnerPurchase(
	purchase: Purchase
): purchase is Purchase & { partnerType: string } {
	return !! purchase?.partner_name;
}

export function isAgencyPartnerType( partnerType: string ) {
	if ( ! partnerType ) {
		return false;
	}
	return [ 'agency', 'a4a_agency' ].includes( partnerType );
}

/**
 * Determines whether the specified product slug refers to either G Suite or Google Workspace.
 */
export function isGSuiteOrGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return isGSuiteProductSlug( productSlug ) || isGoogleWorkspaceProductSlug( productSlug );
}

/**
 * Determines whether the specified product slug is for Google Workspace Business Starter.
 */
function isGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return (
		[
			GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
			GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
		] as readonly string[]
	 ).includes( productSlug );
}

export function isNonDomainSubscription( purchase: Purchase ): boolean {
	if ( purchase.is_domain_registration ) {
		return false;
	}
	if ( isOneTimePurchase( purchase ) ) {
		return false;
	}
	return true;
}

/**
 * Returns a purchase object that corresponds to that subscription's included domain.
 *
 * This can return any type of domain subscription that is eligible to be
 * included with the plan by virtue of having used the plan's domain credit
 * (including domain registrations, domain transfers, and domain mappings).
 *
 * Even if a domain is included with the plan, it will not be returned here if
 * the domain was paid for separately (e.g., if it was renewed on its own).
 * @param   {Purchase[]} sitePurchases  array of purchase objects
 * @param   {Purchase | undefined} subscriptionPurchase  subscription purchase object
 * @returns {Purchase | undefined} domain purchase if there is one, null if none found or not a subscription object passed
 */
export const getIncludedDomainPurchase = (
	sitePurchases: Purchase[],
	subscriptionPurchase: Purchase | undefined
): Purchase | undefined => {
	if ( ! subscriptionPurchase || ! isNonDomainSubscription( subscriptionPurchase ) ) {
		return;
	}

	const { included_domain: includedDomain } = subscriptionPurchase;
	const found = sitePurchases.find(
		( purchase ) =>
			purchase.is_domain && includedDomain === purchase.meta && purchase.cost_to_unbundle_display
	);
	return found;
};

export function hasAmountAvailableToRefund( purchase: Purchase ) {
	return purchase.refund_amount > 0;
}

/**
 * Returns true if the plan is eligible for an instant, self-serve downgrade: the
 * plan is still within its initial refund window (not a renewal) and has neither
 * expired nor entered its post-expiry grace period.
 *
 * Note: this intentionally does NOT require a refundable amount. Instant
 * downgrades are also offered for plans that were paid with credits or are
 * otherwise free, where no money would be refunded.
 *
 * This is distinct from {@link isExpiredAndInGracePeriod}, which gates the
 * downgrade-to-checkout flow for plans whose expiry date has already passed.
 */
export function isWithinRefundWindowDowngradeEligible( purchase: Purchase ): boolean {
	return (
		purchase.is_plan_type_downgradable &&
		purchase.is_plan &&
		purchase.is_within_initial_refund_window &&
		! isExpiredOrRemoved( purchase )
	);
}

/**
 * Returns the purchase cancellation flow.
 */
export function getPurchaseCancellationFlowType( purchase: Purchase ): CancelFlowType {
	const isPlanRefundable = purchase.is_refundable;
	const isPlanAutoRenewing = purchase.is_auto_renew_enabled;

	if ( isPlanRefundable && hasAmountAvailableToRefund( purchase ) ) {
		// If the subscription is refundable the subscription should be removed immediately.
		return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
	}

	// Expired purchases (that aren't refundable) use the removal flow, matching
	// the "Remove" button on the details page.
	if ( isExpiredOrRemoved( purchase ) ) {
		return CANCEL_FLOW_TYPE.REMOVE;
	}

	if ( ! isPlanRefundable && isPlanAutoRenewing ) {
		// If the subscription is not refundable and auto-renew is on turn off auto-renew.
		return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
	}

	// If the subscription is not refundable and auto-renew is off subscription should be removed immediately.
	return CANCEL_FLOW_TYPE.REMOVE;
}

/**
 * Cancel intent sourced from the entry point the user came from.
 * `cancel`      = clicked "Cancel subscription" on Purchase Settings.
 * `remove`      = clicked "Remove subscription / Remove {product}" on Purchase Settings.
 * `auto-renew`  = toggled off auto-renew on Purchase Settings.
 * Absent means flag-off, old deep link, or flow-type heuristic fallback.
 */
export type CancelIntent = 'cancel' | 'remove' | 'auto-renew';

export function getCancelIntentFromSearch( search: { intent?: unknown } ): CancelIntent | null {
	return search.intent === 'cancel' || search.intent === 'remove' || search.intent === 'auto-renew'
		? search.intent
		: null;
}

/**
 * The set of UI variants the cancel/confirmation screens can render. Currently
 * 1:1 with CancelIntent — kept as a separate alias because callers often
 * compute a display variant from intent plus a flow-type fallback.
 */
export type DisplayVariant = 'cancel' | 'remove' | 'auto-renew';

/**
 * Derives which screen variant to show from intent, with a flow-type fallback when intent is absent.
 */
export function getDisplayVariant(
	intent: CancelIntent | null,
	flowType: CancelFlowType
): DisplayVariant {
	if ( intent ) {
		return intent;
	}
	return flowType === CANCEL_FLOW_TYPE.REMOVE ? 'remove' : 'cancel';
}

/**
 * Derives which backend mutation to run from intent + purchase state.
 * Falls back to getPurchaseCancellationFlowType when intent is absent or the intent/state combo is invalid.
 */
export function getMutationFlowType(
	intent: CancelIntent | null,
	purchase: Purchase
): CancelFlowType {
	if ( ! intent ) {
		return getPurchaseCancellationFlowType( purchase );
	}

	// 'cancel' and 'auto-renew' both map to the disable-auto-renew flow when
	// auto-renew is on; both fall back to flow-type otherwise.
	if ( intent === 'cancel' || intent === 'auto-renew' ) {
		if ( purchase.is_auto_renew_enabled ) {
			return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
		}
		return getPurchaseCancellationFlowType( purchase );
	}

	if ( purchase.is_auto_renew_enabled && hasAmountAvailableToRefund( purchase ) ) {
		return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
	}
	return CANCEL_FLOW_TYPE.REMOVE;
}

/**
 * Returns true if a list of products includes a product with a matching product or store product slug.
 */
export function isCentennialPurchase( purchase: Purchase ): boolean {
	return (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD ||
		purchase.is_hundred_year_domain
	);
}

export const hasMarketplaceProduct = ( productsList: Product[], searchSlug: string ): boolean =>
	// storeProductSlug is from the legacy store_products system, billing_product_slug is from
	// the non-legacy billing system and for marketplace plugins will match the slug of the plugin
	// by convention.
	Object.entries( productsList ).some(
		( [ storeProductSlug, { product_type, billing_product_slug } ] ) =>
			( searchSlug === storeProductSlug || searchSlug === billing_product_slug ) &&
			// additional type check needed when called from JS context
			typeof product_type === 'string' &&
			// SaaS products are also considered marketplace products
			( product_type.startsWith( 'marketplace' ) || product_type === 'saas_plugin' )
	);
