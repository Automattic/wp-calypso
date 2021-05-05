/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getGSuiteMailboxCount, hasGSuiteWithUs, hasPendingGSuiteUsers } from 'calypso/lib/gsuite';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';

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

export function resolveEmailPlanStatus( domain ) {
	if ( hasPendingGSuiteUsers( domain ) ) {
		return {
			statusClass: 'warning',
			icon: 'info',
			text: translate( 'Action required' ),
		};
	}

	return {
		statusClass: 'success',
		icon: 'check_circle',
		text: translate( 'Active' ),
	};
}
