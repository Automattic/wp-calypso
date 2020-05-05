/**
 * External dependencies
 */
import { find, includes } from 'lodash';
import moment from 'moment';
import page from 'page';
import i18n from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { getRenewalItemFromProduct } from 'lib/cart-values/cart-items';
import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isJetpackPlan,
	isPlan,
	isTheme,
	isConciergeSession,
} from 'lib/products-values';
import { getJetpackProductsDisplayNames } from 'lib/products-values/constants';

const debug = debugFactory( 'calypso:purchases' );

function getIncludedDomain( purchase ) {
	return purchase.includedDomain;
}

/**
 * Returns an array of sites objects, each of which contains an array of purchases.
 *
 * @param {Array} purchases An array of purchase objects.
 * @param {Array} sites An array of site objects
 * @returns {Array} An array of sites with purchases attached.
 */
function getPurchasesBySite( purchases, sites ) {
	return purchases
		.reduce( ( result, currentValue ) => {
			const site = find( result, { id: currentValue.siteId } );
			if ( site ) {
				site.purchases = site.purchases.concat( currentValue );
			} else {
				const siteObject = find( sites, { ID: currentValue.siteId } );

				result = result.concat( {
					id: currentValue.siteId,
					name: currentValue.siteName,
					/* if the purchase is attached to a deleted site,
					 * there will be no site with this ID in `sites`, so
					 * we fall back on the domain. */
					slug: siteObject ? siteObject.slug : currentValue.domain,
					isDomainOnly: siteObject ? siteObject.options.is_domain_only : false,
					title: currentValue.siteName || currentValue.domain || '',
					purchases: [ currentValue ],
					domain: siteObject ? siteObject.domain : currentValue.domain,
				} );
			}

			return result;
		}, [] )
		.sort( ( a, b ) => ( a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1)  );
}

function getName( purchase ) {
	if ( isDomainRegistration( purchase ) ) {
		return purchase.meta;
	}

	return purchase.productName;
}

function getDisplayName( purchase ) {
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();
	if ( jetpackProductsDisplayNames[ purchase.productSlug ] ) {
		return jetpackProductsDisplayNames[ purchase.productSlug ];
	}
	return getName( purchase );
}

function getPartnerName( purchase ) {
	if ( isPartnerPurchase( purchase ) ) {
		return purchase.partnerName;
	}
	return null;
}

// TODO: refactor to avoid returning a localized string.
function getSubscriptionEndDate( purchase ) {
	const localeSlug = i18n.getLocaleSlug();
	return moment( purchase.expiryDate ).locale( localeSlug ).format( 'LL' );
}

/**
 * Adds a purchase renewal to the cart and redirects to checkout.
 *
 * @param {object} purchase - the purchase to be renewed
 * @param {string} siteSlug - the site slug to renew the purchase for
 * @param {object} tracksProps - where was the renew button clicked from
 */
function handleRenewNowClick( purchase, siteSlug, tracksProps = {} ) {
	const renewItem = getRenewalItemFromProduct( purchase, {
		domain: purchase.meta,
	} );

	// Track the renew now submit.
	recordTracksEvent( 'calypso_purchases_renew_now_click', {
		product_slug: purchase.productSlug,
		...tracksProps,
	} );

	const { product_slug, extra, meta } = renewItem;
	const { purchaseId, purchaseDomain } = extra;
	if ( ! purchaseId ) {
		notices.error( 'Could not find purchase id for renewal.' );
		throw new Error( 'Could not find purchase id for renewal.' );
	}
	if ( ! product_slug ) {
		notices.error( 'Could not find product slug for renewal.' );
		throw new Error( 'Could not find product slug for renewal.' );
	}
	// There is a product with this weird slug, but left to itself the slug will
	// cause a routing error since it contains a slash, so we encode it here and
	// then decode it in the checkout code before adding to the cart.
	const productSlug = product_slug === 'no-adverts/no-adverts.php' ? 'no-ads' : product_slug;
	const productList = meta ? `${ productSlug }:${ meta }` : productSlug;
	const renewalUrl = `/checkout/${ productList }/renew/${ purchaseId }/${
		siteSlug || purchaseDomain || ''
	}`;
	debug( 'handling renewal click', purchase, siteSlug, renewItem, renewalUrl );

	page( renewalUrl );
}

function hasIncludedDomain( purchase ) {
	return Boolean( purchase.includedDomain );
}

function isAutoRenewing( purchase ) {
	return 'autoRenewing' === purchase.expiryStatus;
}

/**
 * Checks if a purchase can be cancelled.
 * Returns true for purchases that aren't expired
 * Also returns true for purchases whether or not they are after the refund period.
 * Purchases included with a plan can't be cancelled.
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} whether the purchase is cancelable
 */
function isCancelable( purchase ) {
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

function isExpired( purchase ) {
	return 'expired' === purchase.expiryStatus;
}

function isExpiring( purchase ) {
	return includes( [ 'manualRenew', 'expiring' ], purchase.expiryStatus );
}

function isIncludedWithPlan( purchase ) {
	return 'included' === purchase.expiryStatus;
}

function isOneTimePurchase( purchase ) {
	return 'oneTimePurchase' === purchase.expiryStatus;
}

function isPaidWithPaypal( purchase ) {
	return 'paypal' === purchase.payment.type;
}

function isPaidWithCredits( purchase ) {
	return 'undefined' !== typeof purchase.payment && 'credits' === purchase.payment.type;
}

function hasPaymentMethod( purchase ) {
	return 'undefined' !== typeof purchase.payment && null != purchase.payment.type;
}

function isPendingTransfer( purchase ) {
	return purchase.pendingTransfer;
}

/**
 * Checks if a purchase credit card number can be updated
 * Payments done via CC & Paygate can have their CC updated, but this
 * is not currently true for other providers such as EBANX.
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase card can be updated
 */
function cardProcessorSupportsUpdates( purchase ) {
	return (
		isPaidWithCreditCard( purchase ) &&
		purchase.payment.creditCard.processor !== 'WPCOM_Billing_Ebanx'
	);
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
 *
 * @param {object} purchase - the purchase with which we are concerned
 *
 * @returns {boolean} Whether in refund period.
 */
function maybeWithinRefundPeriod( purchase ) {
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
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase can be recharged by us through the bound payment method.
 */
function isRechargeable( purchase ) {
	return purchase.isRechargeable;
}

/**
 * Checks if a purchase can be canceled and refunded via the WordPress.com API.
 * Purchases usually can be refunded up to 30 days after purchase.
 * Domains and domain mappings can be refunded up to 96 hours.
 * Purchases included with plan can't be refunded.
 *
 * If this function returns false but you want to see if the subscription may
 * still be within its refund period (and therefore refundable if the user
 * contacts a Happiness Engineer), use maybeWithinRefundPeriod().
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase is refundable
 */
function isRefundable( purchase ) {
	return purchase.isRefundable;
}

/**
 * Checks if a purchase is refundable, and that the amount available to
 * refund is greater than zero.
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} if the purchase is refundable with an amount greater than zero
 * @see isRefundable
 */
function hasAmountAvailableToRefund( purchase ) {
	return isRefundable( purchase ) && purchase.refundAmount > 0;
}

/**
 * Checks whether the specified purchase can be removed from a user account.
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase can be removed, false otherwise
 */
function isRemovable( purchase ) {
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

	return (
		isJetpackPlan( purchase ) ||
		isExpiring( purchase ) ||
		isExpired( purchase ) ||
		( isDomainTransfer( purchase ) && isPurchaseCancelable( purchase ) ) ||
		( isDomainRegistration( purchase ) && isAutoRenewing( purchase ) )
	);
}

function isPartnerPurchase( purchase ) {
	return !! purchase.partnerName;
}

/**
 * Returns the purchase cancelable flag, as opposed to the super weird isCancelable function which
 * manually checks all kinds of stuff
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase has cancelable flag, false otherwise
 */
function isPurchaseCancelable( purchase ) {
	return purchase.isCancelable;
}

/**
 * Checks whether the purchase is in a renewable state per alot of underlying
 * business logic like "have we captured an auth?", "are we within 90 days of expiry?",
 * "is this part of a bundle?", etc.
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase is renewable per business logic, false otherwise
 */
function isRenewable( purchase ) {
	return purchase.isRenewable;
}

function isRenewal( purchase ) {
	return purchase.isRenewal;
}

function isRenewing( purchase ) {
	return includes( [ 'active', 'autoRenewing' ], purchase.expiryStatus );
}

function isSubscription( purchase ) {
	const nonSubscriptionFunctions = [ isDomainRegistration, isOneTimePurchase ];

	return ! nonSubscriptionFunctions.some( ( fn ) => fn( purchase ) );
}

function isPaidWithCreditCard( purchase ) {
	return 'credit_card' === purchase.payment.type && hasCreditCardData( purchase );
}

function isPaidWithPayPalDirect( purchase ) {
	return 'paypal_direct' === purchase.payment.type && purchase.payment.expiryDate;
}

function hasCreditCardData( purchase ) {
	return Boolean( purchase.payment.creditCard.expiryDate );
}

function shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) {
	if ( ! purchase || ! purchase.expiryDate ) {
		return false;
	}
	return moment( purchase.expiryDate ) > moment().add( 3, 'months' );
}

/**
 * Checks whether the purchase is capable of being renewed by intentional
 * action (eg, a button press by user). Some purchases (eg, .fr domains)
 * are only renewable via auto-renew.
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {boolean} true if the purchase is capable of explicit renew
 */
function canExplicitRenew( purchase ) {
	return purchase.canExplicitRenew;
}

function creditCardExpiresBeforeSubscription( purchase ) {
	const creditCard = purchase?.payment?.creditCard;

	return (
		isPaidWithCreditCard( purchase ) &&
		hasCreditCardData( purchase ) &&
		moment( creditCard.expiryDate, 'MM/YY' ).isBefore( purchase.expiryDate, 'months' )
	);
}

function creditCardHasAlreadyExpired( purchase ) {
	const creditCard = purchase?.payment?.creditCard;

	return (
		isPaidWithCreditCard( purchase ) &&
		hasCreditCardData( purchase ) &&
		moment( creditCard.expiryDate, 'MM/YY' ).isBefore( moment.now(), 'months' )
	);
}

function shouldRenderExpiringCreditCard( purchase ) {
	return (
		! isExpired( purchase ) &&
		! isExpiring( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase )
	);
}

function monthsUntilCardExpires( purchase ) {
	const creditCard = purchase.payment.creditCard;
	const expiry = moment( creditCard.expiryDate, 'MM/YY' );
	return expiry.diff( moment(), 'months' );
}

function subscribedWithinPastWeek( purchase ) {
	// Subscribed date should always be in the past. One week ago would be -7 days.
	return (
		'undefined' !== typeof purchase.subscribedDate &&
		moment( purchase.subscribedDate ).diff( moment(), 'days' ) >= -7
	);
}

/**
 * Returns the payment logo to display based on the payment method
 *
 * @param {object} purchase - the purchase with which we are concerned
 * @returns {string|null} the payment logo type, or null if no payment type is set.
 */
function paymentLogoType( purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		return purchase.payment.creditCard.type;
	}

	if ( isPaidWithPayPalDirect( purchase ) ) {
		return 'placeholder';
	}

	return purchase.payment.type || null;
}

function purchaseType( purchase ) {
	if ( isTheme( purchase ) ) {
		return i18n.translate( 'Premium Theme' );
	}

	if ( isConciergeSession( purchase ) ) {
		return i18n.translate( 'One-on-one Support' );
	}

	if ( isPartnerPurchase( purchase ) ) {
		return i18n.translate( 'Host Managed Plan' );
	}

	if ( isPlan( purchase ) ) {
		return i18n.translate( 'Site Plan' );
	}

	if ( isDomainRegistration( purchase ) ) {
		return purchase.productName;
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}

function getRenewalPrice( purchase ) {
	return purchase.saleAmount || purchase.amount;
}

function showCreditCardExpiringWarning( purchase ) {
	return (
		! isIncludedWithPlan( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase ) &&
		monthsUntilCardExpires( purchase ) < 3
	);
}

function getDomainRegistrationAgreementUrl( purchase ) {
	return purchase.domainRegistrationAgreementUrl;
}

export {
	canExplicitRenew,
	creditCardExpiresBeforeSubscription,
	creditCardHasAlreadyExpired,
	getDomainRegistrationAgreementUrl,
	getIncludedDomain,
	getName,
	getDisplayName,
	getPartnerName,
	getPurchasesBySite,
	getRenewalPrice,
	getSubscriptionEndDate,
	handleRenewNowClick,
	hasAmountAvailableToRefund,
	hasIncludedDomain,
	isCancelable,
	isPaidWithCreditCard,
	isPaidWithPayPalDirect,
	isPaidWithPaypal,
	isPaidWithCredits,
	isPartnerPurchase,
	hasPaymentMethod,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRechargeable,
	isRefundable,
	isRemovable,
	isRenewable,
	isRenewal,
	isRenewing,
	isSubscription,
	maybeWithinRefundPeriod,
	paymentLogoType,
	purchaseType,
	cardProcessorSupportsUpdates,
	showCreditCardExpiringWarning,
	subscribedWithinPastWeek,
	shouldAddPaymentSourceInsteadOfRenewingNow,
	shouldRenderExpiringCreditCard,
};
