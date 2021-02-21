/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { transferStatus, type as domainTypes } from './constants';
import { isExpiringSoon } from 'calypso/lib/domains/utils/is-expiring-soon';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils/is-recently-registered';
import { hasPendingGSuiteUsers } from 'calypso/lib/gsuite';
import { shouldRenderExpiringCreditCard } from 'calypso/lib/purchases';

export function resolveDomainStatus(
	domain,
	purchase = null,
	{ isJetpackSite = null, isSiteAutomatedTransfer = null, isDomainOnlySite = false } = {}
) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			if ( isExpiringSoon( domain, 30 ) ) {
				const expiresMessage = translate( 'Expires in %(days)s', {
					args: { days: moment.utc( domain.expiry ).fromNow( true ) },
				} );

				if ( isExpiringSoon( domain, 5 ) ) {
					return {
						statusText: expiresMessage,
						statusClass: 'status-error',
						icon: 'info',
						listStatusText: expiresMessage,
						listStatusClass: 'alert',
					};
				}

				return {
					statusText: expiresMessage,
					statusClass: 'status-warning',
					icon: 'info',
					listStatusText: expiresMessage,
					listStatusClass: 'warning',
				};
			}

			if ( ( ! isJetpackSite || isSiteAutomatedTransfer ) && ! domain.pointsToWpcom ) {
				return {
					statusText: translate( 'Complete setup' ),
					statusClass: 'status-warning',
					icon: 'info',
					listStatusText: translate( 'Complete setup' ),
					listStatusClass: 'warning',
				};
			}

			if ( hasPendingGSuiteUsers( domain ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				icon: 'check_circle',
			};

		case domainTypes.REGISTERED:
			if ( domain.pendingTransfer ) {
				return {
					statusText: translate( 'Outbound transfer initiated' ),
					statusClass: 'status-error',
					icon: 'cached',
				};
			}

			if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			if ( domain.isPendingIcannVerification && domain.currentUserCanManage ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			if ( domain.expired ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
					listStatusText: translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: moment( domain.expiry ).fromNow(),
						},
						comment:
							'timeSinceExpiry is of the form "[number] [time-period] ago" e.g. "3 days ago"',
					} ),
					listStatusClass: 'alert',
				};
			}

			if ( isExpiringSoon( domain, 30 ) ) {
				const expiresMessage = translate( 'Expires in %(days)s', {
					args: { days: moment.utc( domain.expiry ).fromNow( true ) },
				} );

				if ( isExpiringSoon( domain, 5 ) ) {
					return {
						statusText: expiresMessage,
						statusClass: 'status-error',
						icon: 'info',
						listStatusText: expiresMessage,
						listStatusClass: 'alert',
					};
				}

				return {
					statusText: expiresMessage,
					statusClass: 'status-warning',
					icon: 'info',
					listStatusText: expiresMessage,
					listStatusClass: 'warning',
				};
			}

			if ( isRecentlyRegistered( domain.registrationDate ) ) {
				return {
					statusText: translate( 'Activating' ),
					statusClass: 'status-success',
					icon: 'cloud_upload',
					listStatusText: translate( 'Activating' ),
					listStatusClass: 'info',
				};
			}

			if ( hasPendingGSuiteUsers( domain ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			if ( isDomainOnlySite ) {
				return {
					statusText: translate( 'Parked' ),
					statusClass: 'status-neutral',
					icon: 'download_done',
				};
			}

			if ( domain?.isPremium ) {
				return {
					statusText: translate( 'Active' ),
					statusClass: 'status-premium',
					icon: 'check_circle',
					listStatusClass: 'premium',
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				icon: 'check_circle',
			};

		case domainTypes.SITE_REDIRECT:
			if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				icon: 'check_circle',
			};

		case domainTypes.WPCOM:
			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				icon: 'check_circle',
			};

		case domainTypes.TRANSFER:
			if ( domain.transferStatus === transferStatus.PENDING_START ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					icon: 'info',
					listStatusText: translate( 'Action required' ),
					listStatusClass: 'alert',
				};
			} else if ( domain.transferStatus === transferStatus.CANCELLED ) {
				return {
					statusText: translate( 'Transfer failed' ),
					statusClass: 'status-error',
					icon: 'info',
					listStatusText: translate( 'Transfer failed' ),
					listStatusClass: 'alert',
				};
			}

			return {
				statusText: translate( 'Transfer in progress' ),
				statusClass: 'status-success',
				icon: 'cached',
			};

		default:
			return {};
	}
}
