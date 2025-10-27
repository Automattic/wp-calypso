import {
	AkismetPlans,
	JetpackPlans,
	domainProductSlugs,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GoogleWorkspaceSlugs,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_STATS_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	PRODUCT_1GB_SPACE,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	SubscriptionBillPeriod,
	TitanMailSlugs,
	WPCOM_DIFM_LITE,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { getLocaleData, __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import { isGSuiteProductSlug } from './gsuite';
import { planHasFeature } from './site-features';
import { isSiteAutomatedTransfer } from './site-types';
import { encodeProductForUrl } from './wpcom-checkout';
import type { Product, Purchase, Site } from '@automattic/api-core';

//used
export const getManagePurchaseUrlFor = (
	targetSiteSlug: string,
	targetPurchaseId: string | number
): string => `/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }`;

//used
export const CANCEL_FLOW_TYPE = {
	REMOVE: 'remove',
	CANCEL_WITH_REFUND: 'cancel_with_refund',

	// In the end the following two might be merged into one.
	// Before that happens, we still need to distinguish the two.

	// When users effectively cancelling the auto-renewal by
	// cancelling a subscription out of the refund window
	CANCEL_AUTORENEW: 'cancel_autorenew',
};

//used
export const purchasesRoot = '/me/purchases';
// const addNewPaymentMethod = purchasesRoot + '/add-payment-method';

//used
export function managePurchase( siteName: string, purchaseId: number ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	return purchasesRoot + `/${ siteName }/${ purchaseId }`;
}

function isJetpackProductSlug( productSlug: string ): boolean {
	return ( JETPACK_PRODUCTS_LIST as ReadonlyArray< string > ).includes( productSlug );
}

//used
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

//used
export function isExpired( purchase: Purchase ) {
	return 'expired' === purchase.expiry_status;
}

//used
export function isIncludedWithPlan( purchase: Purchase ) {
	return 'included' === purchase.expiry_status;
}

//used
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

//used
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
//used
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

//used
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

//used
export function isJetpackTemporarySitePurchase( purchase: Purchase ): boolean {
	return isTemporarySitePurchase( purchase ) && purchase.product_type === 'jetpack';
}

//used
export function isJetpackStatsSlug( productSlug: string ) {
	return ( JETPACK_STATS_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}

//used
export function isJetpackAntiSpamSlug( productSlug: string ): boolean {
	return ( JETPACK_ANTI_SPAM_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}

//used
export function isJetpackBackupSlug( productSlug: string ): boolean {
	return ( JETPACK_BACKUP_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}

//used
export function isJetpackBoostSlug( productSlug: string ): boolean {
	return ( JETPACK_BOOST_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}

//used
export function isJetpackScanSlug( productSlug: string ): boolean {
	return ( JETPACK_SCAN_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}

//used
export function isJetpackSearchSlug( productSlug: string ): boolean {
	return ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}

//used
export function isJetpackVideoPressSlug( productSlug: string ): boolean {
	return ( JETPACK_VIDEOPRESS_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
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
//used
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
	if ( ! purchase ) {
		return null;
	}
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
//used
export function isJetpackStatsPaidProductSlug( productSlug: string ) {
	return (
		[
			PRODUCT_JETPACK_STATS_BI_YEARLY,
			PRODUCT_JETPACK_STATS_YEARLY,
			PRODUCT_JETPACK_STATS_MONTHLY,
			PRODUCT_JETPACK_STATS_PWYW_YEARLY,
		] as ReadonlyArray< string >
	 ).includes( productSlug );
}

export function isGoogleWorkspace( purchase: Purchase | ObjectWithProductSlug ): boolean {
	return (
		purchase.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY ||
		purchase.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
	);
}

//used
export function isSiteRedirect( purchase: Purchase ): boolean {
	return purchase.product_slug === 'offsite_redirect';
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
	return product.product_slug ? JETPACK_SEARCH_PRODUCTS.includes( product.product_slug ) : false;
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

//used
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
	return `/checkout/${ servicePath }${ checkoutProductSlug }/renew/${ purchaseIds }/${ checkoutSiteSlug }`;
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

//used
export function getName( purchase: Purchase ): string {
	if ( isDomainRegistration( purchase ) || isDomainMapping( purchase ) ) {
		return purchase.meta ?? '';
	}
	return purchase.product_name;
}

// String matching
//used
export type WithSnakeCaseSlug = { product_slug: string };
//used
export type WithCamelCaseSlug = { productSlug: string };

//used
export function camelOrSnakeSlug( product: WithCamelCaseSlug | WithSnakeCaseSlug ): string {
	return 'product_slug' in product ? product.product_slug : product.productSlug ?? '';
}
// End string matching

//used
export function isDomainMapping( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === 'domain_map';
}

//used
export function isDomainRegistration( product ): boolean {
	return !! ( product?.is_domain_registration || product?.isDomainRegistration );
}

//used
export function isDomainTransfer( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === domainProductSlugs.TRANSFER_IN;
}

// Plan matches
// end Plan matches

// plan / product / business determination
//used
//used
export function isJetpackProduct( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackProductSlug( camelOrSnakeSlug( product ) );
}

/**
 * Checks if a purchase can be canceled and refunded via the WordPress.com API.
 * Purchases usually can be refunded up to 14 days after purchase.
 * Domains and domain mappings can be refunded up to 96 hours.
 * Purchases included with plan can't be refunded.
 *
 * If this function returns false but you want to see if the subscription may
 * still be within its refund period (and therefore refundable if the user
 * contacts a Happiness Engineer), use maybeWithinRefundPeriod().
 */
//used
export function isRefundable( purchase: Purchase ): boolean {
	if ( ! purchase ) {
		return false;
	}
	return purchase.is_refundable && purchase.product_type !== 'saas_plugin';
}

/**
 * Checks if a purchase is refundable, and that the amount available to
 * refund is greater than zero.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase is refundable with an amount greater than zero
 * @see isRefundable
 */
//used
export function hasAmountAvailableToRefund( purchase: Purchase ): boolean {
	return isRefundable( purchase ) && purchase.refund_amount > 0;
}

//used
export function isSubscription( purchase: Purchase ): boolean {
	const nonSubscriptionFunctions = [ isDomainRegistration, isOneTimePurchase ];

	return ! nonSubscriptionFunctions.some( ( fn ) => fn( purchase ) );
}

//used
export function isPartnerPurchase(
	purchase: Purchase
): purchase is Purchase & { partnerType: string } {
	return !! purchase?.partner_name;
}

//used
export function isAgencyPartnerType( partnerType: string ) {
	if ( ! partnerType ) {
		return false;
	}

	return [ 'agency', 'a4a_agency' ].includes( partnerType );
}

// TODO: refactor to avoid returning a localized string.
//used
export function getSubscriptionEndDate( purchase: Purchase ): string {
	const localeSlug = getLocaleData()?.lang;
	return intlFormat( new Date( purchase.expiry_date ), {
		locale: localeSlug ?? 'en',
	} );
}

function isConciergeSession( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return 'concierge-session' === camelOrSnakeSlug( product );
}

//used
export function isThemePurchase( purchase: { productType: string } ): boolean {
	return 'theme' === purchase.product_type;
}

/**
 * Determines whether the specified product slug refers to either G Suite or Google Workspace.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite or Google Workspace, false otherwise
 */
export function isGSuiteOrGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return isGSuiteProductSlug( productSlug ) || isGoogleWorkspaceProductSlug( productSlug );
}

//used
export function isGSuiteOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return isGSuiteOrGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}

/**
 * Determines whether the specified product slug is for Google Workspace Business Starter.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to Google Workspace Business Starter, false otherwise
 */
function isGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return [
		GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
		GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	].includes( productSlug );
}

//used
export function purchaseType( purchase: Purchase ): string | null {
	if ( isThemePurchase( purchase ) ) {
		return __( 'Premium Theme' );
	}

	if ( isConciergeSession( purchase ) ) {
		return __( 'One-on-one Support' );
	}

	if ( isPartnerPurchase( purchase ) ) {
		if ( isAgencyPartnerType( purchase.partner_type ) ) {
			return __( 'Agency Managed Plan' );
		}

		return __( 'Host Managed Plan' );
	}

	if ( isPlan( purchase ) ) {
		return __( 'Site Plan' );
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

	if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
		return null;
	}

	if ( isA4ATemporarySitePurchase( purchase ) ) {
		return null;
	}

	if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
		return sprintf(
			/* translators: %(domain)s is the domain name */
			__( 'Mailboxes and Productivity Tools at %(domain)s' ),
			{
				domain: purchase.meta as string,
			}
		);
	}

	if ( isTitanMail( purchase ) ) {
		return sprintf(
			/* translators: %(domain)s is the domain name */
			__( 'Mailboxes at %(domain)s' ),
			{
				domain: purchase.meta as string,
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

/**
 * Similar to isCancelable, but doesn't rely on the purchase's cancelability
 * Checks if auto-renew is enabled for purchase, returns true if auto-renew is ON
 * Returns false if purchase is included in plan, purchases included with a plan can't be cancelled
 * Returns false if purchase is expired
 */

//used
export function canAutoRenewBeTurnedOff( purchase: Purchase ) {
	if ( isIncludedWithPlan( purchase ) ) {
		return false;
	}

	if ( isExpired( purchase ) ) {
		return false;
	}

	if ( hasAmountAvailableToRefund( purchase ) ) {
		return true;
	}

	return purchase.is_auto_renew_enabled;
}

//used
export function hasIncludedDomain( purchase: Purchase ) {
	return Boolean( purchase.included_domain );
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
 * @param   {Purchase | null | undefined} subscriptionPurchase  subscription purchase object
 * @returns {Purchase | null | undefined} domain purchase if there is one, null if none found or not a subscription object passed
 */
//used
export const getIncludedDomainPurchase = (
	sitePurchases: Purchase[],
	subscriptionPurchase: Purchase | null | undefined
): Purchase | null | undefined => {
	if (
		! subscriptionPurchase ||
		! isSubscription( subscriptionPurchase ) ||
		subscriptionPurchase.included_domain_purchase_amount
	) {
		return null;
	}

	const { included_domain: includedDomain } = subscriptionPurchase;
	const found = sitePurchases.find(
		( purchase ) =>
			( isDomainMapping( purchase ) ||
				isDomainRegistration( purchase ) ||
				isDomainTransfer( purchase ) ) &&
			includedDomain === purchase.meta
	);
	return found;
};

function isDomainMoveInternal( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === domainProductSlugs.DOMAIN_MOVE_INTERNAL;
}

//used
export function isDomainProduct(
	product: ( WithSnakeCaseSlug | WithCamelCaseSlug ) & {
		is_domain_registration?: boolean;
		isDomainRegistration?: boolean;
	}
): boolean {
	return (
		isDomainMapping( product ) || isDomainRegistration( product ) || isDomainMoveInternal( product )
	);
}

/**
 * Returns the purchase cancellation flow.
 * @param {Purchase} purchase The purchase object
 */
//used
export function getPurchaseCancellationFlowType( purchase: Purchase ): string {
	const isPlanRefundable = isRefundable( purchase );
	const isPlanAutoRenewing = purchase?.is_auto_renew_enabled ?? false;

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
 * @param {Object} productsList - List of products
 * @param {string} searchSlug - Either a product slug e.g. woocommerce-product-csv-import-suite or store product slug, e.g wc_product_csv_import_suite_yearly
 * @returns {boolean}
 */
//used
export const hasMarketplaceProduct = (
	productsList: Record< string, { product_type: string; billing_product_slug: string } >,
	searchSlug: string
): boolean =>
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

const isMarketplaceProduct = ( productsList, productSlug ) => {
	return productsList ? hasMarketplaceProduct( productsList, productSlug ) : false;
};

/**
 * Whether a purchase will trigger an Atomic revert when it is canceled or removed.
 * The backend has the final say on if this actually happens, see:
 * revert_atomic_site_on_subscription_removal() and deactivate_product().
 * This is a helper for UI elements only, it does not control actual revert decisions.
 * @param   {Purchase} purchase        the purchase
 * @param   {Purchase[]} sitePurchases        all purchases for the site
 * @param   {Site}     site            the site
 * @param   {Product[]} productsList   List of products
 * @param   {Array}    linkedPurchases List of purchases that will be also deactivated because they are
 *                                   linked to the given purchase
 * @returns {boolean} True if the Atomic revert will happen, false otherwise.
 */
//used
export const willAtomicSiteRevertAfterPurchaseDeactivation = (
	purchase: Purchase,
	sitePurchases: Purchase[],
	site: Site,
	productsList: Product[],
	linkedPurchases: Purchase[]
) => {
	if ( ! purchase ) {
		return false;
	}

	// Bail if the site not Atomic.
	if ( ! isSiteAutomatedTransfer( site ) ) {
		return false;
	}

	const isAtomicSupportedProduct = ( productSlug ) => {
		if ( isMarketplaceProduct( productsList, productSlug ) ) {
			return true;
		}

		return planHasFeature( productSlug, WPCOM_FEATURES_ATOMIC );
	};

	if ( ! Array.isArray( linkedPurchases ) ) {
		linkedPurchases = [];
	}

	// Bail if none of the purchases to deactivate supports Atomic.
	if (
		! isAtomicSupportedProduct( purchase.product_slug ) &&
		linkedPurchases.every(
			( linkedPurchase ) => ! isAtomicSupportedProduct( linkedPurchase.product_slug )
		)
	) {
		return false;
	}

	const remainingPurchases = sitePurchases.filter(
		( sitePurchase: Purchase ) =>
			sitePurchase.ID !== purchase.ID &&
			linkedPurchases.every( ( linkedPurchase ) => sitePurchase.ID !== linkedPurchase.ID )
	);

	// If there is at least one remaining Atomic supported purchase, the site will be kept in the Atomic infra.
	return ! remainingPurchases.some( ( sitePurchase ) =>
		isAtomicSupportedProduct( sitePurchase.product_slug )
	);
};
