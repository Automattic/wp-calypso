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
	isPendingGSuiteTOSAcceptance,
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
import {
	hasGoogleAccountTOSWarning,
	hasUnusedMailboxWarning,
	hasUnverifiedEmailForward,
} from 'calypso/lib/emails';

export function getNumberOfMailboxesText( domain ) {
	if ( hasGSuiteWithUs( domain ) ) {
		const count = getGSuiteMailboxCount( domain );

		return translate( '%(count)d mailbox', '%(count)d mailboxes', {
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

export function resolveEmailPlanStatus( domain, emailAccount, isLoadingEmails ) {
	const activeStatus = {
		statusClass: 'success',
		icon: isLoadingEmails ? 'cached' : 'check_circle',
		text: isLoadingEmails ? translate( 'Loading details' ) : translate( 'Active' ),
	};

	const errorStatus = {
		statusClass: 'error',
		icon: 'info',
		text: translate( 'Action required' ),
	};

	if ( hasGSuiteWithUs( domain ) ) {
		// Check for pending TOS acceptance warnings at the account level
		if (
			isPendingGSuiteTOSAcceptance( domain ) ||
			( emailAccount && hasGoogleAccountTOSWarning( emailAccount ) )
		) {
			return errorStatus;
		}

		if ( hasPendingGSuiteUsers( domain ) ) {
			return errorStatus;
		}

		return activeStatus;
	}

	if ( hasTitanMailWithUs( domain ) ) {
		// Check for expired subscription
		const titanExpiryDateString = getTitanExpiryDate( domain );

		if ( titanExpiryDateString ) {
			const titanExpiryDate = new Date( titanExpiryDateString );
			const startOfToday = new Date();
			startOfToday.setUTCHours( 0, 0, 0, 0 );

			if ( titanExpiryDate < startOfToday ) {
				return errorStatus;
			}
		}

		// Check for unused mailboxes
		if ( emailAccount && hasUnusedMailboxWarning( emailAccount ) ) {
			return errorStatus;
		}

		// Fallback logic if we don't have an emailAccount - this will initially be the case for the email home page
		if (
			! isLoadingEmails &&
			! emailAccount &&
			getMaxTitanMailboxCount( domain ) > getConfiguredTitanMailboxCount( domain )
		) {
			return errorStatus;
		}

		return activeStatus;
	}

	if ( hasEmailForwards( domain ) && emailAccount && hasUnverifiedEmailForward( emailAccount ) ) {
		return errorStatus;
	}

	return activeStatus;
}
