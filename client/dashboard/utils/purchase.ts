import {
	AkismetPlans,
	JetpackPlans,
	GoogleWorkspaceSlugs,
	JetpackSearchProducts,
	PRODUCT_1GB_SPACE,
	SubscriptionBillPeriod,
	TitanMailSlugs,
	WPCOM_DIFM_LITE,
} from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
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
};

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

export function isMarketplacePlugin( purchase: Purchase ): boolean {
	return (
		purchase.product_type.startsWith( 'marketplace' ) || purchase.product_type === 'saas_plugin'
	);
}

export function isMarketplaceTemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.product_type === 'saas_plugin';
}

export function isJetpackTemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.product_type === 'jetpack';
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
		// translators: productName is the name of the product and quantity is a number (GB stands for GigaBytes)
		return sprintf( __( '%(productName)s %(quantity)s GB' ), {
			productName: purchase.product_name,
			quantity: purchase.renewal_price_tier_usage_quantity,
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
		/* translators: %s is the product name "Akismet Pro", %d is a number of requests/month */
		return sprintf( __( '%(productName)s (%(requests)d requests/month)' ), {
			productName: purchase.product_name.replace( /\s*\(.*$/, '' ).trim(),
			requests: 500 * purchase.renewal_price_tier_usage_quantity,
		} );
	}

	return purchase.product_name;
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
		return __( 'Site Plan' );
	}

	if ( purchase.is_domain_registration ) {
		return purchase.product_name;
	}

	if ( purchase.product_slug === 'domain_map' ) {
		return purchase.product_name;
	}

	if ( isTemporarySitePurchase( purchase ) && purchase.product_type === 'akismet' ) {
		return null;
	}

	if ( isTemporarySitePurchase( purchase ) && purchase.product_type === 'saas_plugin' ) {
		return null;
	}

	if ( isTemporarySitePurchase( purchase ) && isA4ATemporarySitePurchase( purchase ) ) {
		return null;
	}

	if ( purchase.is_google_workspace_product && purchase.meta ) {
		return sprintf(
			// translators: The domain is the domain name of the site
			__( 'Mailboxes and Productivity Tools at %(domain)s' ),
			{
				domain: purchase.meta,
			}
		);
	}

	if ( purchase.is_titan_mail_product && purchase.meta ) {
		return sprintf(
			// translators: The domain is the domain name of the site
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
	return (
		purchase.product_slug === TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ||
		purchase.product_slug === TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
	);
}

export function isGoogleWorkspace( purchase: Purchase | ObjectWithProductSlug ): boolean {
	return (
		purchase.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY ||
		purchase.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
	);
}

export function isSiteRedirect( purchase: Purchase ): boolean {
	return purchase.product_slug === 'offsite_redirect';
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

/**
 * Checks if a product is a Jetpack Search product.
 */
export function isJetpackSearch( product: ObjectWithProductSlug ): boolean {
	return product.product_slug
		? Object.keys( JetpackSearchProducts ).includes( product.product_slug )
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
	if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
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
	const checkoutSiteSlug = checkoutSiteSlugForUrl || firstPurchase.site_slug || '';
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
	return isCloseToExpiration( purchase );
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
 * Returns the purchase cancellation flow.
 */
export function getPurchaseCancellationFlowType( purchase: Purchase ): string {
	const isPlanRefundable = purchase.is_refundable;
	const isPlanAutoRenewing = purchase.is_auto_renew_enabled;

	if ( isPlanRefundable && hasAmountAvailableToRefund( purchase ) ) {
		// If the subscription is refundable the subscription should be removed immediately.
		return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
	} else if ( ! isPlanRefundable && isPlanAutoRenewing ) {
		// If the subscription is not refundable and auto-renew is on turn off auto-renew.
		return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
	}

	// If the subscription is not refundable and auto-renew is off subscription should be removed immediately.
	return CANCEL_FLOW_TYPE.REMOVE;
}

/**
 * Returns true if a list of products includes a product with a matching product or store product slug.
 */
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
