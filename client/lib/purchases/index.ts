import {
	getPlan,
	isMonthly as isMonthlyPlan,
	getProductFromSlug,
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isMonthlyProduct,
	isPlan,
	isThemePurchase,
	isTitanMail,
	isConciergeSession,
	getJetpackProductsDisplayNames,
	getStorageAddOnDisplayName,
	isWpComPlan,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	TYPE_PRO,
	isDIFMProduct,
	isJetpackSearchFree,
	isAkismetProduct,
	isTieredVolumeSpaceAddon,
	is100Year,
	isJetpackAISlug,
	isJetpackStatsPaidProductSlug,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { encodeProductForUrl } from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import i18n, { type TranslateResult } from 'i18n-calypso';
import moment from 'moment';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getRenewalItemFromProduct } from 'calypso/lib/cart-values/cart-items';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isMarketplaceTemporarySitePurchase } from 'calypso/me/purchases/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import type { Purchase } from './types';
import type { SiteDetails } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type {
	MembershipSubscription,
	MembershipSubscriptionsSite,
} from 'calypso/lib/purchases/types';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'calypso:purchases' );

interface PurchaseWithStatus extends Purchase {
	currentPurchaseStatus: string;
}

interface PurchaseStatus {
	[ key: string ]: number;
}

interface SiteStatus {
	[ key: string ]: number;
}

interface SiteWithPurchases {
	id: number;
	name: string;
	slug: string;
	isDomainOnly: boolean;
	title: string;
	purchases: PurchaseWithStatus[];
	isConnected: boolean;
	domain: string;
	currentStatus?: string;
}

export type TracksProps = Record< string, string | number | boolean >;

// Site Sort order: (all purchases are grouped by site) - Sorted by if
// the site or purchases of the site require some action.
const siteStatus: SiteStatus = {
	disconnected: 10,
	pendingActivation: 20,
	hasExpired: 30,
	hasExpiringSoon: 40,
	hasPaymentMethodExpired: 50,
	noPaymentActionNeeded: 60,
	hasCannotManage: 100,
};

// Sort order of the Purchases of each site (sorted by purchase status)
const purchaseStatus: PurchaseStatus = {
	expired: 10,
	paymentMethodExpired: 20,
	expiringSoon: 30,
	noPaymentActionNeeded: 40,
	cannotManage: 100,
};

function getSitePurchasesStatus( site: SiteWithPurchases ) {
	if ( ! site.isConnected ) {
		if ( site.slug === 'siteless.jetpack.com' ) {
			return 'pendingActivation';
		}
		return 'disconnected';
	}
	const { purchases } = site;

	if ( purchases.some( ( purchase ) => purchase.currentPurchaseStatus === 'cannotManage' ) ) {
		return 'hasCannotManage';
	}
	if ( purchases.some( ( purchase ) => purchase.currentPurchaseStatus === 'expired' ) ) {
		return 'hasExpired';
	}
	if (
		purchases.some( ( purchase ) => purchase.currentPurchaseStatus === 'paymentMethodExpired' )
	) {
		return 'hasPaymentMethodExpired';
	}
	if ( purchases.some( ( purchase ) => purchase.currentPurchaseStatus === 'expiringSoon' ) ) {
		return 'hasExpiringSoon';
	}

	return 'noPaymentActionNeeded';
}

function getPurchaseStatus( purchase: PurchaseWithStatus ) {
	const expiry = moment( purchase.expiryDate );

	if ( purchase.isInAppPurchase || isPartnerPurchase( purchase ) ) {
		return 'cannotManage';
	}
	if ( isExpired( purchase ) ) {
		return 'expired';
	}
	if ( creditCardHasAlreadyExpired( purchase ) ) {
		return 'paymentMethodExpired';
	}
	if (
		( isExpiring( purchase ) &&
			expiry < moment().add( 30, 'days' ) &&
			! isRecentMonthlyPurchase( purchase ) ) ||
		( isRenewing( purchase ) &&
			purchase.renewDate &&
			creditCardExpiresBeforeSubscription( purchase ) )
	) {
		return 'expiringSoon';
	}

	return 'noPaymentActionNeeded';
}

/**
 * Returns an array of sites objects, each of which contains an array of purchases.
 * (Sorted by action needed, if any. (ie-. disconnected, pending activation, expired, etc..)
 */
export function getPurchasesBySite(
	purchases: Purchase[],
	sites: SiteDetails[]
): SiteWithPurchases[] {
	const purchasesBySite = purchases.reduce( ( result: SiteWithPurchases[], currentValue ) => {
		const site = result.find( ( site ) => site.id === currentValue.siteId );

		if ( site ) {
			site.purchases = site.purchases.concat( {
				...currentValue,
				currentPurchaseStatus: getPurchaseStatus( currentValue as PurchaseWithStatus ),
			} ) as PurchaseWithStatus[];
			site.isConnected = true;
			return result;
		}

		const siteObject = sites.find( ( site ) => site.ID === currentValue.siteId );

		const accum = result.concat( {
			id: currentValue.siteId,
			name: currentValue.siteName,
			/* if the purchase is attached to a deleted site,
			 * there will be no site with this ID in `sites`, so
			 * we fall back on the domain. */
			slug: siteObject ? siteObject.slug : currentValue.domain,
			isDomainOnly: siteObject?.options?.is_domain_only ?? false,
			title: currentValue.siteName || currentValue.domain || '',
			purchases: [
				{
					...currentValue,
					currentPurchaseStatus: getPurchaseStatus( currentValue as PurchaseWithStatus ),
				},
			],
			isConnected: siteObject ? true : false,
			domain: siteObject ? siteObject.domain : currentValue.domain,
		} );
		return accum;
	}, [] );

	// Sort sites and each sites purchases by status importance.
	return (
		purchasesBySite
			.map( ( site ) => ( {
				...site,
				// Sort site's purchases by currentPurchaseStatus importance (which is defined by the 'purchaseStatus' obj.)
				purchases: site.purchases.sort(
					( a, b ) =>
						purchaseStatus[ a.currentPurchaseStatus ] - purchaseStatus[ b.currentPurchaseStatus ]
				),
				currentStatus: getSitePurchasesStatus( site ),
			} ) )
			// Sort sites by the importance of currentStatus (which is defined by the 'siteStatus' obj.)
			.sort( ( a, b ) => {
				return siteStatus[ a.currentStatus ] - siteStatus[ b.currentStatus ];
			} )
	);
}

/**
 * Returns an array of sites objects, each of which contains an array of subscriptions.
 */
export function getSubscriptionsBySite(
	subscriptions: MembershipSubscription[]
): MembershipSubscriptionsSite[] {
	return subscriptions
		.reduce( ( result: MembershipSubscriptionsSite[], currentValue ) => {
			const site = result.find( ( subscription ) => subscription.id === currentValue.site_id );
			if ( ! site ) {
				return [
					...result,
					{
						id: currentValue.site_id,
						name: currentValue.site_title,
						domain: currentValue.site_url,
						subscriptions: [ currentValue ],
					},
				];
			}

			site.subscriptions = [ ...site.subscriptions, currentValue ];
			return result;
		}, [] )
		.sort( ( a, b ) => {
			const aName = typeof a.name === 'string' ? a.name.toLowerCase() : '';
			const bName = typeof b.name === 'string' ? b.name.toLowerCase() : '';
			return aName > bName ? 1 : -1;
		} );
}

export function getName( purchase: Purchase ): string {
	if ( isDomainRegistration( purchase ) || isDomainMapping( purchase ) ) {
		return purchase.meta ?? '';
	}
	return purchase.productName;
}

export function getDisplayName( purchase: Purchase ): TranslateResult {
	const { productName, productSlug, purchaseRenewalQuantity } = purchase;
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames( 'full' );

	if (
		isJetpackAISlug( purchase.productSlug ) &&
		purchase.purchaseRenewalQuantity &&
		purchase.priceTierList?.length
	) {
		return i18n.translate( '%(productName)s (%(quantity)s requests per month)', {
			args: {
				productName: jetpackProductsDisplayNames[ productSlug ],
				quantity: formatNumber( purchase.purchaseRenewalQuantity ),
			},
		} );
	}

	if (
		isJetpackStatsPaidProductSlug( purchase.productSlug ) &&
		purchase.purchaseRenewalQuantity &&
		purchase.priceTierList?.length
	) {
		return i18n.translate( '%(productName)s (%(quantity)s views per month)', {
			args: {
				productName: jetpackProductsDisplayNames[ productSlug ],
				quantity: formatNumber( purchase.purchaseRenewalQuantity ),
			},
		} );
	}

	if ( jetpackProductsDisplayNames[ productSlug ] ) {
		return jetpackProductsDisplayNames[ productSlug ];
	}

	if ( isTieredVolumeSpaceAddon( purchase ) ) {
		return getStorageAddOnDisplayName( productName, purchaseRenewalQuantity );
	}

	return getName( purchase );
}

export function getPartnerName( purchase: Purchase ): string | null {
	if ( isPartnerPurchase( purchase ) ) {
		return purchase.partnerName ?? null;
	}
	return null;
}

// TODO: refactor to avoid returning a localized string.
export function getSubscriptionEndDate( purchase: Purchase ): string {
	const localeSlug = i18n.getLocaleSlug();
	return moment( purchase.expiryDate )
		.locale( localeSlug ?? 'en' )
		.format( 'LL' );
}

/**
 * Adds a purchase renewal to the cart and redirects to checkout.
 * @param {Object} purchase - the purchase to be renewed
 * @param {string} siteSlug - the site slug to renew the purchase for
 * @param {Object} [options] - optional information
 * @param {string} [options.redirectTo] - Passed as redirect_to in checkout
 * @param {Object} [options.tracksProps] - where was the renew button clicked from
 */
export function handleRenewNowClick(
	purchase: Purchase,
	siteSlug: string,
	options: { redirectTo?: string; tracksProps?: TracksProps } = {}
) {
	return ( dispatch: CalypsoDispatch ) => {
		try {
			const renewItem = getRenewalItemFromProduct( purchase, { domain: purchase.meta } );

			// Track the renew now submit.
			recordTracksEvent( 'calypso_purchases_renew_now_click', {
				product_slug: purchase.productSlug,
				...options.tracksProps,
			} );

			if ( ! renewItem.extra?.purchaseId ) {
				throw new Error( 'Could not find purchase id for renewal.' );
			}
			if ( ! renewItem.product_slug ) {
				throw new Error( 'Could not find product slug for renewal.' );
			}
			const { productSlugs, purchaseIds } = getProductSlugsAndPurchaseIds( [ renewItem ] );

			let serviceSlug = '';

			if ( isAkismetProduct( { product_slug: productSlugs[ 0 ] } ) ) {
				serviceSlug = 'akismet/';
			} else if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
				serviceSlug = 'marketplace/';
			}

			let renewalUrl = `/checkout/${ serviceSlug }${ productSlugs[ 0 ] }/renew/${
				purchaseIds[ 0 ]
			}/${ siteSlug || '' }`;
			if ( options.redirectTo ) {
				renewalUrl += '?redirect_to=' + encodeURIComponent( options.redirectTo );
			}
			debug( 'handling renewal click', purchase, siteSlug, renewItem, renewalUrl );

			page(
				isJetpackCloud() || isA8CForAgencies() ? `https://wordpress.com${ renewalUrl }` : renewalUrl
			);
		} catch ( error ) {
			dispatch( errorNotice( ( error as Error ).message ) );
		}
	};
}

/**
 * Adds all purchases renewal to the cart and redirects to checkout.
 * @param {Array} purchases - the purchases to be renewed
 * @param {string} siteSlug - the site slug to renew the purchase for
 * @param {Object} [options] - optional information
 * @param {string} [options.redirectTo] - Passed as redirect_to in checkout
 * @param {Object} [options.tracksProps] - where was the renew button clicked from
 */
export function handleRenewMultiplePurchasesClick(
	purchases: Purchase[],
	siteSlug: string,
	options: { redirectTo?: string; tracksProps?: TracksProps } = {}
) {
	return ( dispatch: CalypsoDispatch ) => {
		try {
			purchases.forEach( ( purchase ) => {
				// Track the renew now submit.
				recordTracksEvent( 'calypso_purchases_renew_multiple_click', {
					product_slug: purchase.productSlug,
					...options.tracksProps,
				} );
			} );

			const renewItems = purchases.map( ( otherPurchase ) =>
				getRenewalItemFromProduct( otherPurchase, {
					domain: otherPurchase.meta,
				} )
			);
			const { productSlugs, purchaseIds } = getProductSlugsAndPurchaseIds( renewItems );

			if ( purchaseIds.length === 0 ) {
				throw new Error( 'Could not find product slug or purchase id for renewal.' );
			}

			let renewalUrl = `/checkout/${ productSlugs.join( ',' ) }/renew/${ purchaseIds.join(
				','
			) }/${ siteSlug || '' }`;
			if ( options.redirectTo ) {
				renewalUrl += '?redirect_to=' + encodeURIComponent( options.redirectTo );
			}
			debug( 'handling renewal click', purchases, siteSlug, renewItems, renewalUrl );

			page( renewalUrl );
		} catch ( error ) {
			dispatch( errorNotice( ( error as Error ).message ) );
		}
	};
}

function getProductSlugsAndPurchaseIds( renewItems: MinimalRequestCartProduct[] ) {
	const productSlugs: string[] = [];
	const purchaseIds: string[] = [];

	renewItems.forEach( ( currentRenewItem ) => {
		if ( ! currentRenewItem.extra?.purchaseId ) {
			debug( 'Could not find purchase id for renewal.', currentRenewItem );
			return null;
		}
		if ( ! currentRenewItem.product_slug ) {
			debug( 'Could not find product slug for renewal.', currentRenewItem );
			return null;
		}
		// Some product slugs or meta contain slashes which will break the URL, so
		// we encode them first. We cannot use encodeURIComponent because the
		// calypso router seems to break if the trailing part of the URL contains
		// an encoded slash.
		const productSlug = encodeProductForUrl( currentRenewItem.product_slug );
		productSlugs.push(
			currentRenewItem.meta
				? `${ productSlug }:${ encodeProductForUrl( currentRenewItem.meta ) }`
				: productSlug
		);
		purchaseIds.push( currentRenewItem.extra.purchaseId );
	} );
	return { productSlugs, purchaseIds };
}

export function hasIncludedDomain( purchase: Purchase ) {
	return Boolean( purchase.includedDomain );
}

export function isAutoRenewing( purchase: Purchase ) {
	return 'autoRenewing' === purchase.expiryStatus;
}

/**
 * Checks if a purchase can be cancelled.
 * Returns true for purchases that aren't expired
 * Also returns true for purchases whether or not they are after the refund period.
 * Purchases included with a plan can't be cancelled.
 */
export function isCancelable( purchase: Purchase ) {
	if ( isIncludedWithPlan( purchase ) ) {
		return false;
	}

	if ( isPendingTransfer( purchase ) ) {
		return false;
	}

	if ( isExpired( purchase ) ) {
		return false;
	}

	if ( hasAmountAvailableToRefund( purchase ) ) {
		return true;
	}

	return purchase.canDisableAutoRenew;
}

/**
 * Similar to isCancelable, but doesn't rely on the purchase's cancelability
 * Checks if auto-renew is enabled for purchase, returns true if auto-renew is ON
 * Returns false if purchase is included in plan, purchases included with a plan can't be cancelled
 * Returns false if purchase is expired
 */

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

	return purchase.isAutoRenewEnabled;
}

export function isExpired( purchase: Purchase ) {
	return 'expired' === purchase.expiryStatus;
}

export function isExpiring( purchase: Purchase ) {
	return [ 'manualRenew', 'expiring' ].includes( purchase.expiryStatus );
}

export function isIncludedWithPlan( purchase: Purchase ) {
	return 'included' === purchase.expiryStatus;
}

export function isOneTimePurchase( purchase: Purchase ) {
	return 'oneTimePurchase' === purchase.expiryStatus;
}

export function isPaidWithPaypal( purchase: Purchase ) {
	return 'paypal' === purchase.payment.type;
}

export function isPaidWithCredits( purchase: Purchase ) {
	return 'undefined' !== typeof purchase.payment && 'credits' === purchase.payment.type;
}

export function hasPaymentMethod( purchase: Purchase ) {
	return 'undefined' !== typeof purchase.payment && null != purchase.payment.type;
}

function isPendingTransfer( purchase: Purchase ) {
	return purchase.pendingTransfer;
}

/**
 * Determines if this is a monthly purchase.
 *
 * This function takes into account WordPress.com and Jetpack plans as well as
 * Jetpack products.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean}  True if the provided purchase is monthly, or false if not
 */
export function isMonthlyPurchase( purchase: Purchase ): boolean {
	const plan = getPlan( purchase.productSlug );
	if ( plan ) {
		return isMonthlyPlan( purchase.productSlug );
	}

	// Note that getProductFromSlug() returns a string when given a non-product
	// slug, so we need to check that it's an object before using it.
	const product = getProductFromSlug( purchase.productSlug );
	if ( product && typeof product !== 'string' ) {
		return isMonthlyProduct( product );
	}

	return false;
}

/**
 * Determines if this is a recent monthly purchase (bought within the past week).
 *
 * This is often used to ensure that notices about purchases which expire
 * "soon" are not displayed with error styling to a user who just purchased a
 * monthly subscription (which by definition will expire relatively soon).
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean}  True if the provided purchase is a recent monthy purchase, or false if not
 */
export function isRecentMonthlyPurchase( purchase: Purchase ): boolean {
	return subscribedWithinPastWeek( purchase ) && isMonthlyPurchase( purchase );
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
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean}  True if the provided purchase needs to renew soon, or false if not
 */
export function needsToRenewSoon( purchase: Purchase ): boolean {
	// Skip purchases that never need to renew or that can't be renewed.
	if (
		isOneTimePurchase( purchase ) ||
		isPartnerPurchase( purchase ) ||
		! isRenewable( purchase ) ||
		! canExplicitRenew( purchase )
	) {
		return false;
	}

	return isCloseToExpiration( purchase );
}

/**
 * Returns true for purchases that are expired or expiring/renewing soon.
 *
 * The latter is defined as within one month of expiration for monthly
 * subscriptions (i.e., one billing period) and within three months of
 * expiration for everything else.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean}  True if the provided purchase is close to expiration, or false if not
 */
export function isCloseToExpiration( purchase: Purchase ): boolean {
	if ( ! purchase.expiryDate ) {
		return false;
	}

	const expiryThresholdInMonths = isMonthlyPurchase( purchase ) ? 1 : 3;
	return moment( purchase.expiryDate ).diff( Date.now(), 'months' ) < expiryThresholdInMonths;
}

/**
 * Checks if a purchase might be in the refund period, whether refundable or not.
 *
 * If you need to determine whether a purchase can be programmatically refunded
 * via the WordPress.com API, use isRefundable() instead.
 *
 * This function attempts to catch some additional edge cases in which a
 * purchase is refundable by policy but where isRefundable() returns false and
 * which would therefore require the assistance of a Happiness Engineer to
 * actually refund it.
 *
 * The results aren't guaranteed to be reliable, so don't use them to promise
 * or deny a refund to a user. Instead, for example, use it to decide whether
 * to display or highlight general help text about the refund policy to users
 * who are likely to be eligible for one.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} Whether in refund period.
 */
export function maybeWithinRefundPeriod( purchase: Purchase ): boolean {
	if ( isRefundable( purchase ) ) {
		return true;
	}

	// This looks at how much time has elapsed since the subscription date,
	// which should be relatively reliable for new subscription refunds, but
	// not renewals. To be completely accurate, this would need to look at the
	// transaction date instead, but by definition this function needs to work
	// in scenarios where we don't know exactly which transaction needs to be
	// refunded.
	// Another source of uncertainty here is that it relies on the user's
	// clock, which might not be accurate.
	return (
		'undefined' !== typeof purchase.subscribedDate &&
		'undefined' !== typeof purchase.refundPeriodInDays &&
		moment().diff( moment( purchase.subscribedDate ), 'days' ) <= purchase.refundPeriodInDays
	);
}

/**
 * Checks if a purchase have a bound payment method that we can recharge.
 * This ties to the auto-renewal. At the moment, the only eligble methods are credit cards and Paypal.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase can be recharged by us through the bound payment method.
 */
export function isRechargeable( purchase: Purchase ): boolean {
	return purchase.isRechargeable;
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
export function isRefundable( purchase: Purchase ): boolean {
	return purchase.isRefundable && purchase.productType !== 'saas_plugin';
}

/**
 * Checks if a purchase is refundable, and that the amount available to
 * refund is greater than zero.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase is refundable with an amount greater than zero
 * @see isRefundable
 */
export function hasAmountAvailableToRefund( purchase: Purchase ): boolean {
	return isRefundable( purchase ) && purchase.refundAmount > 0;
}

/**
 * Checks whether the specified purchase can be removed from a user account.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase can be removed, false otherwise
 */
export function isRemovable( purchase: Purchase ): boolean {
	if ( hasAmountAvailableToRefund( purchase ) ) {
		return false;
	}

	if ( isIncludedWithPlan( purchase ) ) {
		if ( isDomainMapping( purchase ) ) {
			return true;
		}
		return false;
	}

	if ( isConciergeSession( purchase ) ) {
		return false;
	}

	if ( isJetpackSearchFree( purchase ) ) {
		return true;
	}

	return (
		isExpiring( purchase ) ||
		isExpired( purchase ) ||
		( isDomainTransfer( purchase ) && isPurchaseCancelable( purchase ) ) ||
		( isDomainRegistration( purchase ) && isAutoRenewing( purchase ) )
	);
}

export function isPartnerPurchase(
	purchase: Purchase
): purchase is Purchase & { partnerType: string } {
	return !! purchase.partnerName;
}

/**
 * Returns the purchase cancelable flag, as opposed to the super weird isCancelable function which
 * manually checks all kinds of stuff
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase has cancelable flag, false otherwise
 */
export function isPurchaseCancelable( purchase: Purchase ): boolean {
	return purchase.isCancelable;
}

/**
 * Checks whether the purchase is in a renewable state per alot of underlying
 * business logic like "have we captured an auth?", "are we within 90 days of expiry?",
 * "is this part of a bundle?", etc.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase is renewable per business logic, false otherwise
 */
export function isRenewable( purchase: Purchase ): boolean {
	return purchase.isRenewable;
}

export function isRenewal( purchase: Purchase ): boolean {
	return purchase.isRenewal;
}

export function isRenewing( purchase: Purchase ): boolean {
	return [ 'active', 'autoRenewing' ].includes( purchase.expiryStatus );
}

export function isWithinIntroductoryOfferPeriod( purchase: Purchase ): boolean {
	return purchase.introductoryOffer?.isWithinPeriod ?? false;
}

export function isIntroductoryOfferFreeTrial( purchase: Purchase ): boolean {
	return purchase.introductoryOffer?.costPerInterval === 0;
}

export function isSubscription( purchase: Purchase ): boolean {
	const nonSubscriptionFunctions = [ isDomainRegistration, isOneTimePurchase ];

	return ! nonSubscriptionFunctions.some( ( fn ) => fn( purchase ) );
}

export function isPaidWithCreditCard( purchase: Purchase ) {
	return 'credit_card' === purchase.payment.type && hasCreditCardData( purchase );
}

export function isPaidWithPayPalDirect( purchase: Purchase ) {
	return 'paypal_direct' === purchase.payment.type && purchase.payment.expiryDate;
}

function hasCreditCardData( purchase: Purchase ) {
	return Boolean( purchase.payment.creditCard?.expiryDate );
}

export function shouldAddPaymentSourceInsteadOfRenewingNow( purchase: Purchase ) {
	if ( ! purchase || ! purchase.expiryDate ) {
		return false;
	}
	return moment( purchase.expiryDate ) > moment().add( 3, 'months' );
}

/**
 * Checks whether the purchase is capable of being renewed by intentional
 * action (eg, a button press by user). Some purchases (eg, .fr domains)
 * are only renewable via auto-renew.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase is capable of explicit renew
 */
export function canExplicitRenew( purchase: Purchase ): boolean {
	return purchase.canExplicitRenew;
}

/**
 * Checks whether the purchase can have auto-renewal turned back on
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase can have auto renewal re-enabled
 */
export function canReenableAutoRenewal( purchase: Purchase ): boolean {
	return purchase.canReenableAutoRenewal;
}

export function creditCardExpiresBeforeSubscription( purchase: Purchase ) {
	const creditCard = purchase?.payment?.creditCard;

	return (
		isPaidWithCreditCard( purchase ) &&
		hasCreditCardData( purchase ) &&
		( ! is100Year( purchase ) || isCloseToExpiration( purchase ) ) &&
		moment( creditCard?.expiryDate, 'MM/YY' ).isBefore( purchase.expiryDate, 'months' )
	);
}

export function creditCardHasAlreadyExpired( purchase: Purchase ) {
	const creditCard = purchase?.payment?.creditCard;

	return (
		creditCard &&
		isPaidWithCreditCard( purchase ) &&
		hasCreditCardData( purchase ) &&
		( ! is100Year( purchase ) || isCloseToExpiration( purchase ) ) &&
		moment( creditCard.expiryDate, 'MM/YY' ).isBefore( moment.now(), 'months' )
	);
}

export function shouldRenderExpiringCreditCard( purchase: Purchase ) {
	return (
		! isExpired( purchase ) &&
		! isExpiring( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase )
	);
}

export function monthsUntilCardExpires( purchase: Purchase ) {
	const creditCard = purchase.payment.creditCard;
	const expiry = moment( creditCard?.expiryDate, 'MM/YY' );
	return expiry.diff( moment(), 'months' );
}

export function subscribedWithinPastWeek( purchase: Purchase ) {
	// Subscribed date should always be in the past. One week ago would be -7 days.
	return (
		'undefined' !== typeof purchase.subscribedDate &&
		moment( purchase.subscribedDate ).diff( moment(), 'days' ) >= -7
	);
}

/**
 * Returns the payment logo to display based on the payment method
 * 'displayBrand' respects the customer's card brand choice if available
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {string|null} the payment logo type, or null if no payment type is set.
 */
export function paymentLogoType( purchase: Purchase ): string | null | undefined {
	if ( isPaidWithCreditCard( purchase ) ) {
		return purchase.payment.creditCard?.displayBrand
			? purchase.payment.creditCard?.displayBrand
			: purchase.payment.creditCard?.type;
	}

	if ( isPaidWithPayPalDirect( purchase ) ) {
		return 'placeholder';
	}

	return purchase.payment.type || null;
}

export function isAgencyPartnerType( partnerType: string ) {
	if ( ! partnerType ) {
		return false;
	}

	return [ 'agency', 'a4a_agency' ].includes( partnerType );
}

export function purchaseType( purchase: Purchase ): string | null {
	if ( isThemePurchase( purchase ) ) {
		return i18n.translate( 'Premium Theme' );
	}

	if ( isConciergeSession( purchase ) ) {
		return i18n.translate( 'One-on-one Support' );
	}

	if ( isPartnerPurchase( purchase ) ) {
		if ( isAgencyPartnerType( purchase.partnerType ) ) {
			return i18n.translate( 'Agency Managed Plan' );
		}

		return i18n.translate( 'Host Managed Plan' );
	}

	if ( isPlan( purchase ) ) {
		return i18n.translate( 'Site Plan' );
	}

	if ( isDomainRegistration( purchase ) ) {
		return purchase.productName;
	}

	if ( isDomainMapping( purchase ) ) {
		return purchase.productName;
	}

	if ( isAkismetProduct( purchase ) ) {
		return null;
	}

	if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
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

	if ( purchase.productType === 'marketplace_plugin' || purchase.productType === 'saas_plugin' ) {
		return i18n.translate( 'Plugin' );
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}

export function getRenewalPrice( purchase: Purchase ) {
	return purchase.saleAmount || purchase.amount;
}

export function getRenewalPriceInSmallestUnit( purchase: Purchase ) {
	return purchase.saleAmountInteger || purchase.priceInteger;
}

export function showCreditCardExpiringWarning( purchase: Purchase ) {
	return (
		! isIncludedWithPlan( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase ) &&
		monthsUntilCardExpires( purchase ) < 3
	);
}

export function getDomainRegistrationAgreementUrl( purchase: Purchase ) {
	return purchase.domainRegistrationAgreementUrl;
}

export function shouldRenderMonthlyRenewalOption( purchase: Purchase ) {
	if ( ! purchase || ! purchase.expiryDate ) {
		return false;
	}

	if ( ! isWpComPlan( purchase.productSlug ) ) {
		return false;
	}

	const plan = getPlan( purchase.productSlug );

	if ( ! [ TERM_ANNUALLY, TERM_BIENNIALLY, TERM_TRIENNIALLY ].includes( plan?.term ?? '' ) ) {
		return false;
	}

	if ( TYPE_PRO === plan?.type ) {
		return false;
	}

	const isAutorenewalEnabled = ! isExpiring( purchase );
	const daysTillExpiry = moment( purchase.expiryDate ).diff( Date.now(), 'days' );

	// Auto renew is off and expiration is <90 days from now
	if ( ! isAutorenewalEnabled && daysTillExpiry < 90 ) {
		return true;
	}

	// We attempted to bill them <30 days prior to their annual renewal and
	// we weren’t able to do so for any other reason besides having auto renew off.
	if ( isAutorenewalEnabled && daysTillExpiry < 30 ) {
		return true;
	}

	return false;
}

const formatPurchasePrice = ( price: number, currency: string ) =>
	formatCurrency( price, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

/**
 * Returns meaningful DIFM purchase details related to tiered difm prices if available
 * Returns null if this is not a DIFM purchase or the proper related price tier information is not available.
 * @param {Object} purchase - the purchase with which we are concerned
 * @returns {Object | null} difm price tier based purchase information breakdown
 */
export const getDIFMTieredPurchaseDetails = (
	purchase: Purchase
): {
	extraPageCount: number | null;
	formattedCostOfExtraPages: string | null;
	formattedOneTimeFee: string;
	numberOfIncludedPages: number | null | undefined;
} | null => {
	if (
		! purchase ||
		! isDIFMProduct( purchase ) ||
		! purchase.priceTierList ||
		! Array.isArray( purchase.priceTierList ) ||
		purchase.priceTierList.length === 0
	) {
		return null;
	}

	const [ tier0, tier1 ] = purchase.priceTierList;
	const perExtraPagePrice = tier1.minimumPrice - tier0.minimumPrice;

	const { maximumUnits: numberOfIncludedPages, minimumPriceDisplay: formattedOneTimeFee } = tier0;
	const { purchaseRenewalQuantity: noOfPages, currencyCode } = purchase;

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
};
