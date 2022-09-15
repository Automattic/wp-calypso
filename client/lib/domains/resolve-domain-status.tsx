import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import moment from 'moment';
import { modeType, stepSlug } from 'calypso/components/domains/connect-domain-step/constants';
import { isSubdomain } from 'calypso/lib/domains';
import { isExpiringSoon } from 'calypso/lib/domains/utils/is-expiring-soon';
import { shouldRenderExpiringCreditCard, handleRenewNowClick } from 'calypso/lib/purchases';
import {
	SETTING_PRIMARY_DOMAIN,
	INCOMING_DOMAIN_TRANSFER_STATUSES,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	GDPR_POLICIES,
	DOMAIN_EXPIRATION,
} from 'calypso/lib/url/support';
import {
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainMappingSetup,
} from 'calypso/my-sites/domains/paths';
import { transferStatus, type as domainTypes, gdprConsentStatus } from './constants';
import type { ResponseDomain } from './types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { I18N } from 'i18n-calypso';
import type { ReactChild } from 'react';

export type ResolveDomainStatusReturn =
	| {
			statusText: ReactChild | Array< ReactChild >;
			statusClass:
				| 'status-error'
				| 'status-warning'
				| 'status-alert'
				| 'status-success'
				| 'status-neutral'
				| 'status-premium';
			status: ReactChild;
			icon: 'info' | 'verifying' | 'check_circle' | 'cached' | 'cloud_upload' | 'download_done';
			listStatusWeight?: number;
			noticeText?: ReactChild | Array< ReactChild > | null;
	  }
	| Record< string, never >;

export type ResolveDomainStatusOptionsBag = {
	isJetpackSite?: boolean | null;
	isSiteAutomatedTransfer?: boolean | null;
	isDomainOnlySite?: boolean | null;
	siteSlug?: string | null;
	getMappingErrors?: boolean | null;
};

export function resolveDomainStatus(
	domain: ResponseDomain,
	purchase: Purchase | null = null,
	translate: I18N[ 'translate' ],
	dispatch: CalypsoDispatch,
	{
		isJetpackSite = null,
		isSiteAutomatedTransfer = null,
		isDomainOnlySite = null,
		siteSlug = null,
		getMappingErrors = false,
	}: ResolveDomainStatusOptionsBag = {}
): ResolveDomainStatusReturn {
	const transferOptions = {
		components: {
			strong: <strong />,
			a: (
				<a
					href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS ) }
					rel="noopener noreferrer"
					target="_blank"
					onClick={ ( e ) => e.stopPropagation() }
				/>
			),
		},
		args: {
			transferFinishDate: moment.utc( domain.transferEndDate ).format( 'LL' ),
		},
	};

	let mappingSetupStep: string =
		domain.connectionMode === modeType.ADVANCED
			? stepSlug.ADVANCED_UPDATE
			: stepSlug.SUGGESTED_UPDATE;
	if ( isSubdomain( domain.domain ) ) {
		mappingSetupStep =
			domain.connectionMode === modeType.ADVANCED
				? stepSlug.SUBDOMAIN_ADVANCED_UPDATE
				: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE;
	}

	const mappingSetupComponents = {
		strong: <strong />,
		a: (
			<a
				href={ domainMappingSetup( siteSlug as string, domain.domain, mappingSetupStep ) }
				onClick={ ( e ) => e.stopPropagation() }
			/>
		),
	};

	switch ( domain.type ) {
		case domainTypes.MAPPED:
			if ( isExpiringSoon( domain, 30 ) ) {
				const expiresMessage =
					null !== domain.bundledPlanSubscriptionId
						? translate(
								'Domain connection expires with your plan on {{strong}}%(expiryDate)s{{/strong}}',
								{
									args: { expiryDate: moment.utc( domain.expiry ).format( 'LL' ) },
									components: { strong: <strong /> },
								}
						  )
						: translate( 'Domain connection expires in {{strong}}%(days)s{{/strong}}', {
								args: { days: moment.utc( domain.expiry ).fromNow( true ) },
								components: { strong: <strong /> },
						  } );

				let noticeText = null;

				if ( ! domain.pointsToWpcom ) {
					noticeText = translate(
						"We noticed that something wasn't updated correctly. Please try {{a}}this setup{{/a}} again.",
						{ components: mappingSetupComponents }
					);
				}

				let status = translate( 'Active' );
				if ( ! domain.autoRenewing ) {
					status = domain.bundledPlanSubscriptionId
						? translate( 'Expires with your plan' )
						: translate( 'Expiring soon' );
				}

				return {
					statusText: expiresMessage,
					statusClass: `status-${ domain.autoRenewing ? 'success' : 'error' }`,
					status: status,
					icon: 'info',
					listStatusWeight: isExpiringSoon( domain, 7 ) ? 1000 : 800,
					noticeText,
				};
			}

			if ( getMappingErrors && siteSlug !== null ) {
				const registrationDatePlus3Days = moment.utc( domain.registrationDate ).add( 3, 'days' );

				const hasMappingError =
					domain.type === domainTypes.MAPPED &&
					! domain.pointsToWpcom &&
					moment.utc().isAfter( registrationDatePlus3Days );

				if ( hasMappingError ) {
					return {
						statusText: translate( 'Connection error' ),
						statusClass: 'status-alert',
						status: translate( 'Error' ),
						icon: 'info',
						noticeText: translate(
							"We noticed that something wasn't updated correctly. Please try {{a}}this setup{{/a}} again.",
							{ components: mappingSetupComponents }
						),
						listStatusWeight: 1000,
					};
				}
			}

			if ( ( ! isJetpackSite || isSiteAutomatedTransfer ) && ! domain.pointsToWpcom ) {
				return {
					statusText: translate( 'Verifying' ),
					statusClass: 'status-success',
					status: translate( 'Verifying' ),
					icon: 'verifying',
					noticeText: translate(
						'It can take between a few minutes to 72 hours to verify the connection. You can continue to work on your site, but {{strong}}%(domainName)s{{/strong}} won’t be reachable just yet. You can review the {{a}}setup instructions{{/a}} to ensure everything is correct.',
						{
							components: mappingSetupComponents,
							args: {
								domainName: domain.name,
							},
						}
					),
					listStatusWeight: 600,
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: translate( 'Active' ),
				icon: 'check_circle',
			};

		case domainTypes.REGISTERED:
			if ( domain.aftermarketAuction ) {
				const statusMessage = translate( 'Expired' );
				return {
					statusText: statusMessage,
					statusClass: 'status-warning',
					status: statusMessage,
					icon: 'info',
					noticeText: translate(
						'This domain expired more than 30 days ago and is no longer available to manage or renew. We may be able to restore it after {{strong}}%(aftermarketAuctionEnd)s{{/strong}}. {{a}}Learn more{{/a}}',
						{
							components: {
								strong: <strong />,
								a: (
									<a
										href={ localizeUrl( DOMAIN_EXPIRATION ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							},
							args: {
								aftermarketAuctionEnd: moment.utc( domain.aftermarketAuctionEnd ).format( 'LL' ),
							},
						}
					),
					listStatusWeight: 400,
				};
			}

			if ( domain.isPendingRenewal ) {
				const pendingRenewalMessage = translate( 'Renewal in progress' );
				return {
					statusText: pendingRenewalMessage,
					statusClass: 'status-success',
					status: translate( 'Renewing' ),
					icon: 'info',
					noticeText: translate( 'Attempting to get it renewed for you.' ),
					listStatusWeight: 400,
				};
			}

			if ( domain.pendingTransfer ) {
				return {
					statusText: translate( 'Outbound transfer initiated' ),
					statusClass: 'status-success',
					status: translate( 'In progress' ),
					icon: 'cached',
				};
			}

			if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Action required' ),
					icon: 'info',
					listStatusWeight: 600,
				};
			}

			if ( domain.isPendingIcannVerification && domain.isIcannVerificationSuspended ) {
				return {
					statusText: translate( 'Suspended' ),
					statusClass: 'status-error',
					status: translate( 'Suspended' ),
					icon: 'info',
					listStatusWeight: 800,
				};
			}

			if ( domain.isPendingIcannVerification ) {
				const noticeText = domain.currentUserIsOwner
					? translate(
							'We sent you an email to verify your contact information. Please complete the verification or your domain will stop working. You can also {{a}}change your email address{{/a}} if you like.',
							{
								components: {
									a: (
										<a
											href={ domainManagementEditContactInfo( siteSlug as string, domain.name ) }
										></a>
									),
								},
								args: {
									domainName: domain.name,
								},
							}
					  )
					: translate(
							'We sent an email to the domain owner. Please complete the verification or your domain will stop working.'
					  );

				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Verify email' ),
					noticeText,
					icon: 'info',
					listStatusWeight: 600,
				};
			}

			if ( domain.expired ) {
				let renewCta;

				if ( domain.isRenewable ) {
					const renewableUntil = moment.utc( domain.renewableUntil ).format( 'LL' );

					renewCta =
						purchase && siteSlug && domain.currentUserIsOwner
							? translate(
									'You can renew the domain at the regular rate until {{strong}}%(renewableUntil)s{{/strong}}. {{a}}Renew now{{/a}}',
									{
										components: {
											strong: <strong />,
											a: (
												<Button
													plain
													onClick={ () => dispatch( handleRenewNowClick( purchase, siteSlug ) ) }
												/>
											),
										},
										args: { renewableUntil },
									}
							  )
							: translate(
									'The domain owner can renew the domain at the regular rate until {{strong}}%(renewableUntil)s{{/strong}}.',
									{
										components: {
											strong: <strong />,
										},
										args: { renewableUntil },
									}
							  );
				} else if ( domain.isRedeemable ) {
					const redeemableUntil = moment.utc( domain.redeemableUntil ).format( 'LL' );

					renewCta =
						purchase && siteSlug && domain.currentUserIsOwner
							? translate(
									'You can still renew the domain until {{strong}}%(redeemableUntil)s{{/strong}} by paying an additional redemption fee. {{a}}Renew now{{/a}}',
									{
										components: {
											strong: <strong />,
											a: (
												<Button
													plain
													onClick={ () => dispatch( handleRenewNowClick( purchase, siteSlug ) ) }
												/>
											),
										},
										args: { redeemableUntil },
									}
							  )
							: translate(
									'The domain owner can still renew the domain until {{strong}}%(redeemableUntil)s{{/strong}} by paying an additional redemption fee.',
									{
										components: {
											strong: <strong />,
										},
										args: { redeemableUntil },
									}
							  );
				}

				const domainExpirationMessage = translate(
					'This domain expired on {{strong}}%(expiryDate)s{{/strong}}. ',
					{
						components: {
							strong: <strong />,
						},
						args: {
							expiryDate: moment.utc( domain.expiry ).format( 'LL' ),
							renewCta,
						},
					}
				);

				const noticeText = [ domainExpirationMessage ];
				if ( renewCta ) {
					noticeText.push( renewCta );
				}

				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Expired' ),
					icon: 'info',
					noticeText,
					listStatusWeight: 1000,
				};
			}

			if ( isExpiringSoon( domain, 30 ) ) {
				const renewCta =
					purchase && siteSlug && domain.currentUserIsOwner
						? translate( '{{a}}Renew now{{/a}}', {
								components: {
									a: (
										<Button
											plain
											onClick={ () => dispatch( handleRenewNowClick( purchase, siteSlug ) ) }
										/>
									),
								},
						  } )
						: translate( 'It can be renewed by the owner.' );

				const domainExpirationMessage = translate(
					'This domain will expire on {{strong}}%(expiryDate)s{{/strong}}. ',
					{
						args: { expiryDate: moment.utc( domain.expiry ).format( 'LL' ) },
						components: { strong: <strong /> },
					}
				);

				const expiresMessage = [ domainExpirationMessage ];
				if ( renewCta ) {
					expiresMessage.push( renewCta );
				}

				if ( isExpiringSoon( domain, 5 ) ) {
					return {
						statusText: domainExpirationMessage,
						statusClass: 'status-error',
						status: translate( 'Expiring soon' ),
						icon: 'info',
						noticeText: expiresMessage,
						listStatusWeight: 1000,
					};
				}

				return {
					statusText: expiresMessage,
					statusClass: 'status-warning',
					status: translate( 'Expiring soon' ),
					icon: 'info',
					noticeText: expiresMessage,
					listStatusWeight: 800,
				};
			}

			if ( domain.pendingRegistration ) {
				let noticeText;
				if ( domain.isPrimary ) {
					noticeText = translate(
						'We are setting up your domain. It should start working immediately, but may be unreliable during the first 30 minutes. If you are unable to access your site at {{strong}}%(domainName)s{{/strong}}, try setting the primary domain to a domain you know is working. {{learnMore}}Learn more{{/learnMore}} about setting the primary domain, or try {{try}}{{strong}}%(domainName)s{{/strong}}{{/try}} now.',
						{
							args: {
								domainName: domain.name,
							},
							components: {
								strong: <strong />,
								learnMore: (
									<a
										href={ localizeUrl( SETTING_PRIMARY_DOMAIN ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
								try: (
									<a href={ `http://${ domain.name }` } rel="noopener noreferrer" target="_blank" />
								),
							},
						}
					);
				} else {
					noticeText = translate(
						'We are setting up your domain. It should start working immediately, but may be unreliable during the first 30 minutes.'
					);
				}

				return {
					statusText: translate( 'Activating' ),
					statusClass: 'status-success',
					status: translate( 'Activating' ),
					icon: 'cloud_upload',
					noticeText,
					listStatusWeight: 400,
				};
			}

			if ( isDomainOnlySite ) {
				return {
					statusText: translate( 'Parked' ),
					statusClass: 'status-neutral',
					status: translate( 'Parked' ),
					icon: 'download_done',
				};
			}

			if ( domain?.isPremium ) {
				return {
					statusText: translate( 'Active' ),
					statusClass: 'status-premium',
					status: translate( 'Active' ),
					icon: 'check_circle',
				};
			}

			if ( domain.transferStatus === transferStatus.COMPLETED && ! domain.pointsToWpcom ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-success',
					status: translate( 'Active' ),
					icon: 'info',
					noticeText: translate(
						'{{strong}}Transfer successful!{{/strong}} To make this domain work with your WordPress.com site you need {{a}}point it to WordPress.com name servers.{{/a}}',
						{
							components: {
								strong: <strong />,
								a: <a href={ domainManagementEdit( siteSlug as string, domain.domain ) } />,
							},
						}
					),
					listStatusWeight: 600,
				};
			}

			if ( gdprConsentStatus.PENDING_ASYNC === domain.gdprConsentStatus ) {
				const detailCta = domain.currentUserIsOwner
					? translate( 'Please check the email sent to you for further details' )
					: translate( 'Please check the email sent to the domain owner for further details' );

				const noticeText = translate(
					'This domain requires explicit user consent to complete the registration. %(detailCta)s. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <a href={ localizeUrl( GDPR_POLICIES ) } />,
						},
						args: { detailCta },
					}
				);
				return {
					statusText: noticeText,
					statusClass: 'status-warning',
					status: translate( 'Pending' ),
					icon: 'info',
					noticeText: noticeText,
					listStatusWeight: 400,
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: translate( 'Active' ),
				icon: 'check_circle',
			};

		case domainTypes.SITE_REDIRECT:
			if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Action required' ),
					icon: 'info',
					listStatusWeight: 600,
				};
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: translate( 'Active' ),
				icon: 'check_circle',
			};

		case domainTypes.WPCOM:
			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: translate( 'Active' ),
				icon: 'check_circle',
			};

		case domainTypes.TRANSFER:
			if ( domain.transferStatus === transferStatus.PENDING_START ) {
				return {
					statusText: translate( 'Complete setup' ),
					statusClass: 'status-warning',
					status: translate( 'Complete setup' ),
					icon: 'info',
					noticeText: translate(
						'Please follow {{a}}these instructions{{/a}} to start the transfer.',
						{
							components: {
								a: (
									<a
										href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_STATUSES ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							},
						}
					),
					listStatusWeight: 600,
				};
			} else if ( domain.transferStatus === transferStatus.CANCELLED ) {
				return {
					statusText: translate( 'Transfer failed' ),
					statusClass: 'status-error',
					status: translate( 'Failed' ),
					icon: 'info',
					noticeText: translate(
						'Transfer failed. Learn the possible {{a}}reasons why{{/a}}.',
						transferOptions
					),
					listStatusWeight: 1000,
				};
			} else if ( domain.transferStatus === transferStatus.PENDING_REGISTRY ) {
				if ( domain.transferEndDate ) {
					return {
						statusText: translate( 'Transfer in progress' ),
						statusClass: 'status-success',
						status: translate( 'In progress' ),
						icon: 'info',
						noticeText: translate(
							'The transfer should complete by {{strong}}%(transferFinishDate)s{{/strong}}. We are waiting for authorization from your current domain provider to proceed. {{a}}Learn more{{/a}}',
							transferOptions
						),
						listStatusWeight: 200,
					};
				}
				return {
					statusText: translate( 'Transfer in progress' ),
					statusClass: 'status-success',
					status: translate( 'In progress' ),
					icon: 'info',
					noticeText: translate(
						'We are waiting for authorization from your current domain provider to proceed. {{a}}Learn more{{/a}}',
						transferOptions
					),
					listStatusWeight: 200,
				};
			}

			return {
				statusText: translate( 'Transfer in progress' ),
				statusClass: 'status-success',
				status: translate( 'In progress' ),
				icon: 'cached',
				noticeText: domain.transferEndDate
					? translate(
							'The transfer should complete by {{strong}}%(transferFinishDate)s{{/strong}}. {{a}}Learn more{{/a}}',
							transferOptions
					  )
					: null,
				listStatusWeight: 200,
			};

		default:
			return {};
	}
}
