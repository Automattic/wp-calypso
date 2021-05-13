/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getGSuiteMailboxCount,
	getGSuiteSubscriptionId,
	hasGSuiteWithUs,
	hasPendingGSuiteUsers,
} from 'calypso/lib/gsuite';
import {
	getConfiguredTitanMailboxCount,
	getMaxTitanMailboxCount,
	getTitanExpiryDate,
	getTitanSubscriptionId,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';

export function getNumberOfMailboxesText( domain ) {
	if ( hasGSuiteWithUs( domain ) ) {
		const count = getGSuiteMailboxCount( domain );
		return translate( '%(count)d user', '%(count)d users', {
			count,
			args: {
				count,
			},
		} );
	}

	if ( hasTitanMailWithUs( domain ) ) {
		const count = getMaxTitanMailboxCount( domain );
		return translate( '%(count)d mailbox', '%(count)d mailboxes', {
			count,
			args: {
				count,
			},
		} );
	}

	if ( hasEmailForwards( domain ) ) {
		const count = getEmailForwardsCount( domain );
		return translate( '%(count)d email forward', '%(count)d email forwards', {
			count,
			args: {
				count,
			},
		} );
	}
	return '';
}

/**
 * Retrieves the email purchase associated to the specified domain.
 *
 * @param {object} state - global state
 * @param {object} domain - domain object
 * @returns {object|null} the corresponding email purchase, or null if not found
 */
export function getEmailPurchaseByDomain( state, domain ) {
	const subscriptionId = getEmailSubscriptionIdByDomain( domain );

	return subscriptionId ? getByPurchaseId( state, subscriptionId ) : null;
}

/**
 * Retrieves the identifier of the email subscription for the specified domain.
 *
 * @param {object} domain - domain object
 * @returns {number|null} the corresponding subscription id, or null if not found
 */
function getEmailSubscriptionIdByDomain( domain ) {
	let subscriptionId = null;

	if ( hasGSuiteWithUs( domain ) ) {
		subscriptionId = getGSuiteSubscriptionId( domain );
	} else if ( hasTitanMailWithUs( domain ) ) {
		subscriptionId = getTitanSubscriptionId( domain );
	}

	return subscriptionId ? parseInt( subscriptionId, 10 ) : null;
}

/**
 * Determines whether an email subscription exists for the specified domain.
 *
 * @param {object} domain - domain object
 * @returns {boolean} true if an email subscription exists, false otherwise
 */
export function hasEmailSubscription( domain ) {
	const subscriptionId = getEmailSubscriptionIdByDomain( domain );

	return !! subscriptionId;
}

export function resolveEmailPlanStatus( domain ) {
	const defaultWarning = {
		statusClass: 'warning',
		icon: 'info',
		text: translate( 'Action required' ),
	};

	if ( hasGSuiteWithUs( domain ) ) {
		// This is structured this way to fold in ToS acceptance at the account level.
		if ( hasPendingGSuiteUsers( domain ) ) {
			return defaultWarning;
		}
	}

	if ( hasTitanMailWithUs( domain ) ) {
		// Check for expired subscription.
		const titanExpiryDateString = getTitanExpiryDate( domain );
		if ( titanExpiryDateString ) {
			const titanExpiryDate = new Date( titanExpiryDateString );
			const startOfToday = new Date();
			startOfToday.setUTCHours( 0, 0, 0, 0 );
			if ( titanExpiryDate < startOfToday ) {
				return {
					additionalText: translate( 'Your subscription has expired' ),
					...defaultWarning,
				};
			}
		}

		if ( getMaxTitanMailboxCount( domain ) > getConfiguredTitanMailboxCount( domain ) ) {
			return defaultWarning;
		}
	}

	return {
		statusClass: 'success',
		icon: 'check_circle',
		text: translate( 'Active' ),
	};
}
