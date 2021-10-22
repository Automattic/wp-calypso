import { translate } from 'i18n-calypso';
import moment from 'moment';
import { isExpiringSoon } from 'calypso/lib/domains/utils/is-expiring-soon';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils/is-recently-registered';
import { hasPendingGSuiteUsers } from 'calypso/lib/gsuite';
import { shouldRenderExpiringCreditCard } from 'calypso/lib/purchases';
import {
	INCOMING_DOMAIN_TRANSFER_STATUSES,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
} from 'calypso/lib/url/support';
import { domainManagementNameServers, domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { transferStatus, type as domainTypes } from './constants';

export function resolveDomainStatus(
	domain,
	purchase = null,
	{
		isJetpackSite = null,
		isSiteAutomatedTransfer = null,
		isDomainOnlySite = false,
		siteSlug = null,
		getMappingErrors = false,
	} = {}
) {
	const transferOptions = {
		components: {
			strong: <strong />,
			a: (
				<a
					href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
					rel="noopener noreferrer"
					target="_blank"
					onClick={ ( e ) => e.stopPropagation() }
				/>
			),
		},
		args: {
			transferFinishDate: moment( domain.transferEndDate ).format( 'LL' ),
		},
	};

	switch ( domain.type ) {
		case domainTypes.MAPPED:
			if ( isExpiringSoon( domain, 30 ) ) {
				const expiresMessage =
					null !== domain.bundledPlanSubscriptionId
						? translate( 'Domain connection expires with your plan on %(expiryDate)s', {
								args: { expiryDate: moment( domain.expiry ).format( 'LL' ) },
						  } )
						: translate( 'Domain connection expires in %(days)s', {
								args: { days: moment( domain.expiry ).fromNow( true ) },
						  } );

				if ( isExpiringSoon( domain, 5 ) ) {
					return {
						statusText: expiresMessage,
						statusClass: 'status-error',
						status: 'Expiring soon',
						statusColor: 'warning',
						icon: 'info',
						listStatusText: expiresMessage,
						listStatusClass: 'alert',
						listStatusWeight: 1000,
					};
				}

				return {
					statusText: expiresMessage,
					statusClass: 'status-warning',
					status: 'Expiring soon',
					statusColor: 'warning',
					icon: 'info',
					listStatusText: expiresMessage,
					listStatusClass: 'warning',
					listStatusWeight: 800,
				};
			}

			if ( getMappingErrors ) {
				const registrationDatePlus3Days = moment.utc( domain.registrationDate ).add( 3, 'days' );

				const hasMappingError =
					domain.type === domainTypes.MAPPED &&
					! domain.pointsToWpcom &&
					moment.utc().isAfter( registrationDatePlus3Days );

				if ( hasMappingError ) {
					const setupStep =
						domain.connectionMode === 'advanced' ? 'advanced_update' : 'suggested_update';
					const options = {
						components: {
							strong: <strong />,
							a: (
								<a
									href={ domainMappingSetup( siteSlug, domain.domain, setupStep ) }
									onClick={ ( e ) => e.stopPropagation() }
								/>
							),
						},
					};

					let status;
					if ( domain?.connectionMode === 'advanced' ) {
						status = translate(
							'{{strong}}Connection error:{{/strong}} The A records are incorrect. Please {{a}}try this step{{/a}} again.',
							options
						);
					} else {
						status = translate(
							'{{strong}}Connection error:{{/strong}} The name servers are incorrect. Please {{a}}try this step{{/a}} again.',
							options
						);
					}
					return {
						statusText: translate( 'Connection error' ),
						statusClass: 'status-alert',
						icon: 'info',
						listStatusText: status,
						listStatusClass: 'alert',
						listStatusWeight: 1000,
					};
				}
			}

			if ( ( ! isJetpackSite || isSiteAutomatedTransfer ) && ! domain.pointsToWpcom ) {
				const status = translate(
					'{{strong}}Verifying connection:{{/strong}} You can continue to work on your site, but you domain won’t be reachable just yet.',
					{
						components: {
							strong: <strong />,
						},
					}
				);
				return {
					statusText: translate( 'Verifying connection' ),
					statusClass: 'status-verifying',
					status: 'Verifying',
					statusColor: 'ok',
					icon: 'verifying',
					listStatusText: status,
					listStatusClass: 'verifying',
					listStatusWeight: 200,
				};
			}

			if ( hasPendingGSuiteUsers( domain ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: 'Action required',
					statusColor: 'warning',
					icon: 'info',
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: 'Active',
				statusColor: 'ok',
				icon: 'check_circle',
			};

		case domainTypes.REGISTERED:
			if ( domain.isPendingRenewal ) {
				const pendingRenewalMessage = translate( 'Renewal in progress' );
				return {
					statusText: pendingRenewalMessage,
					statusClass: 'status-warning',
					status: 'Renewing',
					statusColor: 'ok',
					icon: 'info',
					listStatusText: pendingRenewalMessage,
					listStatusClass: 'warning',
					listStatusWeight: 800,
				};
			}

			if ( domain.pendingTransfer ) {
				return {
					statusText: translate( 'Outbound transfer initiated' ),
					statusClass: 'status-error',
					status: 'In progress',
					statusColor: 'ok',
					icon: 'cached',
				};
			}

			if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: 'Action required',
					statusColor: 'warning',
					icon: 'info',
				};
			}

			if ( domain.isPendingIcannVerification && domain.currentUserCanManage ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: 'Action required',
					statusColor: 'warning',
					icon: 'info',
				};
			}

			if ( domain.expired ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: 'Expired',
					statusColor: 'warning',
					icon: 'info',
					listStatusText: translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: moment( domain.expiry ).fromNow(),
						},
						comment:
							'timeSinceExpiry is of the form "[number] [time-period] ago" e.g. "3 days ago"',
					} ),
					listStatusClass: 'alert',
					listStatusWeight: 1000,
				};
			}

			if ( isExpiringSoon( domain, 30 ) ) {
				const expiresMessage = translate( 'Expires in %(days)s', {
					args: { days: moment( domain.expiry ).fromNow( true ) },
				} );

				if ( isExpiringSoon( domain, 5 ) ) {
					return {
						statusText: expiresMessage,
						statusClass: 'status-error',
						status: 'Expiring soon',
						statusColor: 'warning',
						icon: 'info',
						listStatusText: expiresMessage,
						listStatusClass: 'alert',
						listStatusWeight: 1000,
					};
				}

				return {
					statusText: expiresMessage,
					statusClass: 'status-warning',
					status: 'Expiring soon',
					statusColor: 'warning',
					icon: 'info',
					listStatusText: expiresMessage,
					listStatusClass: 'warning',
					listStatusWeight: 800,
				};
			}

			if ( isRecentlyRegistered( domain.registrationDate ) ) {
				return {
					statusText: translate( 'Activating' ),
					statusClass: 'status-success',
					status: 'Activating',
					statusColor: 'ok',
					icon: 'cloud_upload',
					listStatusText: translate( 'Activating' ),
					listStatusClass: 'info',
					listStatusWeight: 400,
				};
			}

			if ( hasPendingGSuiteUsers( domain ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: 'Action required',
					statusColor: 'warning',
					icon: 'info',
				};
			}

			if ( isDomainOnlySite ) {
				return {
					statusText: translate( 'Parked' ),
					statusClass: 'status-neutral',
					status: 'Parked',
					statusColor: 'warning',
					icon: 'download_done',
				};
			}

			if ( domain?.isPremium ) {
				return {
					statusText: translate( 'Active' ),
					statusClass: 'status-premium',
					status: 'Active',
					statusColor: 'ok',
					icon: 'check_circle',
					listStatusClass: 'premium',
				};
			}

			if ( domain.transfer_status === transferStatus.COMPLETED && ! domain.pointsToWpcom ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-warning',
					status: 'Complete setup',
					statusColor: 'warning',
					icon: 'info',
					listStatusText: translate(
						'{{strong}}Point to WordPress.com:{{/strong}} To point this domain to your WordPress.com site, you need to update the name servers. {{a}}Update now{{/a}} or do this later.',
						{
							components: {
								strong: <strong />,
								a: (
									<a
										href={ domainManagementNameServers( siteSlug, domain.domain ) }
										onClick={ ( e ) => e.stopPropagation() }
									/>
								),
							},
						}
					),
					listStatusClass: 'transfer-warning',
					listStatusWeight: 600,
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: 'Active',
				statusColor: 'ok',
				icon: 'check_circle',
			};

		case domainTypes.SITE_REDIRECT:
			if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: 'Action required',
					statusColor: 'warning',
					icon: 'info',
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: 'Active',
				statusColor: 'ok',
				icon: 'check_circle',
			};

		case domainTypes.WPCOM:
			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: 'Active',
				statusColor: 'ok',
				icon: 'check_circle',
			};

		case domainTypes.TRANSFER:
			if ( domain.transferStatus === transferStatus.PENDING_START ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-warning',
					status: 'Action required',
					statusColor: 'warning',
					icon: 'info',
					listStatusText: translate(
						'{{strong}}Transfer waiting:{{/strong}} Follow {{a}}these steps{{/a}} by %(beginTransferUntilDate)s to start the transfer.',
						{
							components: {
								strong: <strong />,
								a: (
									<a
										href={ INCOMING_DOMAIN_TRANSFER_STATUSES }
										rel="noopener noreferrer"
										target="_blank"
										onClick={ ( e ) => e.stopPropagation() }
									/>
								),
							},
							args: {
								beginTransferUntilDate: moment( domain.beginTransferUntilDate ).format( 'LL' ),
							},
						}
					),
					listStatusClass: 'transfer-warning',
					listStatusWeight: 600,
				};
			} else if ( domain.transferStatus === transferStatus.CANCELLED ) {
				return {
					statusText: translate( 'Transfer failed' ),
					statusClass: 'status-error',
					status: 'Failed',
					statusColor: 'warning',
					icon: 'info',
					listStatusText: translate(
						'{{strong}}Transfer failed:{{/strong}} this transfer has failed. {{a}}Learn more{{/a}}',
						transferOptions
					),
					listStatusClass: 'alert',
					listStatusWeight: 1000,
				};
			} else if ( domain.transferStatus === transferStatus.PENDING_REGISTRY ) {
				if ( domain.transferEndDate ) {
					return {
						statusText: translate( 'Transfer in progress' ),
						statusClass: 'status-success',
						status: 'In progress',
						statusColor: 'ok',
						icon: 'info',
						listStatusText: translate(
							'{{strong}}Transfer in progress:{{/strong}} the transfer should be completed by %(transferFinishDate)s. We are waiting for approval from your current domain provider to proceed. {{a}}Learn more{{/a}}',
							transferOptions
						),
						listStatusClass: 'verifying',
						listStatusWeight: 200,
					};
				}
				return {
					statusText: translate( 'Transfer in progress' ),
					statusClass: 'status-success',
					status: 'In progress',
					statusColor: 'ok',
					icon: 'info',
					listStatusText: translate(
						'{{strong}}Transfer in progress:{{/strong}} We are waiting for approval from your current domain provider to proceed. {{a}}Learn more{{/a}}',
						transferOptions
					),
					listStatusClass: 'verifying',
					listStatusWeight: 200,
				};
			}

			return {
				statusText: translate( 'Transfer in progress' ),
				statusClass: 'status-success',
				status: 'In progress',
				statusColor: 'ok',
				icon: 'cached',
				listStatusText: translate(
					'{{strong}}Transfer in progress.{{/strong}} {{a}}Learn more{{/a}}',
					transferOptions
				),
				listStatusClass: 'verifying',
				listStatusWeight: 200,
			};

		default:
			return {};
	}
}
