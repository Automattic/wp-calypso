/** @format */

/**
 * External dependencies
 */

import { find, includes } from 'lodash';
import moment from 'moment';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	isJetpackPlan,
	isDomainRegistration,
	isDomainTransfer,
	isPlan,
	isTheme,
} from 'lib/products-values';

function getIncludedDomain( purchase ) {
	return purchase.includedDomain;
}

/**
 * Returns an array of sites objects, each of which contains an array of purchases.
 *
 * @param {array} purchases An array of purchase objects.
 * @param {array} sites An array of site objects
 * @return {array} An array of sites with purchases attached.
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
		.sort( ( a, b ) => ( a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1 ) );
}

function getName( purchase ) {
	if ( isDomainRegistration( purchase ) ) {
		return purchase.meta;
	}

	if ( isJetpackPlan( purchase ) ) {
		return `Jetpack ${ purchase.productName }`;
	}

	return purchase.productName;
}

function getSubscriptionEndDate( purchase ) {
	return purchase.expiryMoment.format( 'LL' );
}

function hasIncludedDomain( purchase ) {
	return Boolean( purchase.includedDomain );
}

function hasPrivacyProtection( purchase ) {
	return purchase.hasPrivacyProtection;
}

/**
 * Checks if a purchase can be cancelled.
 * Returns true for purchases that aren't expired
 * Also returns true for purchases whether or not they are after the refund period.
 * Purchases included with a plan can't be cancelled.
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} whether the purchase is cancelable
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

	if ( isRefundable( purchase ) ) {
		return true;
	}

	return purchase.canDisableAutoRenew;
}

function isExpired( purchase ) {
	return 'expired' === purchase.expiryStatus;
}

function isExpiring( purchase ) {
	return includes(
		[ 'cardExpired', 'cardExpiring', 'manualRenew', 'expiring' ],
		purchase.expiryStatus
	);
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

function isPendingTransfer( purchase ) {
	return purchase.pendingTransfer;
}

/**
 * Checks if a purchase credit card number can be updated
 * Payments done via CC & Paygate can have their CC updated, but this
 * is not currently true for other providers such as EBANX.
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} if the purchase card can be updated
 */
function cardProcessorSupportsUpdates( purchase ) {
	return (
		isPaidWithCreditCard( purchase ) &&
		purchase.payment.creditCard.processor !== 'WPCOM_Billing_Ebanx'
	);
}

/**
 * Checks if a purchase can be canceled and refunded.
 * Purchases usually can be refunded up to 30 days after purchase.
 * Domains and domain mappings can be refunded up to 48 hours.
 * Purchases included with plan can't be refunded.
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} if the purchase is refundable
 */
function isRefundable( purchase ) {
	return purchase.isRefundable;
}

/**
 * Checks whether the specified purchase can be removed from a user account.
 * Purchases included with a plan can't be removed.
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} true if the purchase can be removed, false otherwise
 */
function isRemovable( purchase ) {
	if ( isIncludedWithPlan( purchase ) ) {
		return false;
	}

	return (
		isExpiring( purchase ) ||
		isExpired( purchase ) ||
		( isDomainTransfer( purchase ) &&
			! isRefundable( purchase ) &&
			isPurchaseCancelable( purchase ) )
	);
}

/**
 * Returns the purchase cancelable flag, as opposed to the super weird isCancelable function which
 * manually checks all kinds of stuff
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} true if the purchase has cancelable flag, false otherwise
 */
function isPurchaseCancelable( purchase ) {
	return purchase.isCancelable;
}

/**
 * Checks whether the purchase is in a renewable state per alot of underlying
 * business logic like "have we captured an auth?", "are we within 90 days of expiry?",
 * "is this part of a bundle?", etc.
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} true if the purchase is renewable per business logic, false otherwise
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

	return ! nonSubscriptionFunctions.some( fn => fn( purchase ) );
}

function isPaidWithCreditCard( purchase ) {
	return 'credit_card' === purchase.payment.type && hasCreditCardData( purchase );
}

function isPaidWithPayPalDirect( purchase ) {
	return 'paypal_direct' === purchase.payment.type && purchase.payment.expiryMoment;
}

function hasCreditCardData( purchase ) {
	return Boolean( purchase.payment.creditCard.expiryMoment );
}

/**
 * Checks whether the purchase is capable of being renewed by intentional
 * action (eg, a button press by user). Some purchases (eg, .fr domains)
 * are only renewable via auto-renew.
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {boolean} true if the purchase is capable of explicit renew
 */
function canExplicitRenew( purchase ) {
	return purchase.canExplicitRenew;
}

function creditCardExpiresBeforeSubscription( purchase ) {
	return (
		isPaidWithCreditCard( purchase ) &&
		hasCreditCardData( purchase ) &&
		purchase.payment.creditCard.expiryMoment.diff( purchase.expiryMoment, 'months' ) < 0
	);
}

function monthsUntilCardExpires( purchase ) {
	return purchase.payment.creditCard.expiryMoment.diff( moment(), 'months' );
}

/**
 * Returns the payment logo to display based on the payment method
 *
 * @param {Object} purchase - the purchase with which we are concerned
 * @return {string|null} the payment logo type, or null if no payment type is set.
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

function showCreditCardExpiringWarning( purchase ) {
	return (
		! isIncludedWithPlan( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase ) &&
		monthsUntilCardExpires( purchase ) < 3
	);
}

export {
	canExplicitRenew,
	creditCardExpiresBeforeSubscription,
	getIncludedDomain,
	getName,
	getPurchasesBySite,
	getSubscriptionEndDate,
	hasIncludedDomain,
	hasPrivacyProtection,
	isCancelable,
	isPaidWithCreditCard,
	isPaidWithPayPalDirect,
	isPaidWithPaypal,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRefundable,
	isRemovable,
	isRenewable,
	isRenewal,
	isRenewing,
	isSubscription,
	paymentLogoType,
	purchaseType,
	cardProcessorSupportsUpdates,
	showCreditCardExpiringWarning,
};
