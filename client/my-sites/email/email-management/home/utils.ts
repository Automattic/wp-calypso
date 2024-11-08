import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils';
import {
	hasGoogleAccountTOSWarning,
	hasUnusedMailboxWarning,
	hasUnverifiedEmailForward,
} from 'calypso/lib/emails';
import {
	getGSuiteMailboxCount,
	getGSuiteSubscriptionId,
	getGSuiteSubscriptionStatus,
	hasGSuiteWithUs,
	isPendingGSuiteTOSAcceptance,
} from 'calypso/lib/gsuite';
import {
	getConfiguredTitanMailboxCount,
	getMaxTitanMailboxCount,
	getTitanExpiryDate,
	getTitanSubscriptionId,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import type { EmailAccount } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { AppState } from 'calypso/types';

export function getNumberOfMailboxesText( domain: ResponseDomain ) {
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
 * @param state - global Redux state
 * @param domain - domain object
 * @returns the corresponding email purchase, or null if not found
 */
export function getEmailPurchaseByDomain( state: AppState, domain: ResponseDomain ) {
	const subscriptionId = getEmailSubscriptionIdByDomain( domain );

	return subscriptionId ? getByPurchaseId( state, subscriptionId ) : null;
}

/**
 * Retrieves the identifier of the email subscription for the specified domain.
 * @param domain - domain object
 * @returns the corresponding subscription id, or null if not found
 */
function getEmailSubscriptionIdByDomain( domain: ResponseDomain ) {
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
 * @param domain - domain object
 * @returns true if an email subscription exists, false otherwise
 */
export function hasEmailSubscription( domain: ResponseDomain ) {
	const subscriptionId = getEmailSubscriptionIdByDomain( domain );

	return !! subscriptionId;
}

/**
 * Returns a class name, an icon and a text for signaling the status of an email subscription to
 * the user.
 */
export function resolveEmailPlanStatus(
	domain: ResponseDomain,
	emailAccount: EmailAccount,
	isLoadingEmails: boolean
) {
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

	const cannotManageStatus = {
		statusClass: 'warning',
		icon: 'info',
		text: translate( 'Can’t manage subscription', {
			comment: 'Current user is not allowed to manage email subscription',
		} ),
	};

	if ( hasGSuiteWithUs( domain ) ) {
		if ( ! canCurrentUserAddEmail( domain ) ) {
			return cannotManageStatus;
		}

		// Check for pending TOS acceptance warnings at the account level
		if (
			isPendingGSuiteTOSAcceptance( domain ) ||
			( emailAccount && hasGoogleAccountTOSWarning( emailAccount ) )
		) {
			return errorStatus;
		}

		// When users have registered a domain with us, we let them purchase Google Workspace
		// before the domain provisioning has finished. However, the user won't see any mailboxes
		// in the email management until the domain provisioning has finished. To avoid confusion,
		// we display a warning under these conditions.
		if (
			isRecentlyRegistered( domain.registrationDate, 45 ) &&
			getGSuiteSubscriptionStatus( domain ) === 'unknown'
		) {
			return {
				statusClass: 'warning',
				icon: 'info',
				text: translate( 'Configuring mailboxes' ),
			};
		}

		return activeStatus;
	}

	if ( hasTitanMailWithUs( domain ) ) {
		if ( ! canCurrentUserAddEmail( domain ) ) {
			return cannotManageStatus;
		}

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
		if ( ! isLoadingEmails && emailAccount && hasUnusedMailboxWarning( emailAccount ) ) {
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

/**
 * Tracks an event for the key 'calypso_email_app_launch'.
 */
export function recordEmailAppLaunchEvent( {
	app,
	context,
	provider,
}: {
	app: string;
	context: string;
	provider: string;
} ) {
	recordTracksEvent( 'calypso_email_app_launch', {
		app,
		context,
		provider,
	} );
}

/**
 * Tracks an event for the key 'calypso_{source}_upsell', where {source} defaults to "email".
 *
 * Events tracked:
 * `calypso_inbox_upsell`, when upsell triggered by a CTA click from My Mailboxes.
 * `calypso_email_upsell`, when upsell triggered by a CTA click from Upgrades > Emails.
 * @param source - source generating the event.
 * @param context context, where this event was logged.
 */
export function recordEmailUpsellTracksEvent(
	source: string | null = 'email',
	context: string | null = null
) {
	recordTracksEvent( `calypso_${ source }_upsell`, {
		context,
	} );
}
