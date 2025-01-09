import { localizeUrl } from '@automattic/i18n-utils';
import {
	SETTING_PRIMARY_DOMAIN,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	GDPR_POLICIES,
	DOMAIN_EXPIRATION_AUCTION,
} from '@automattic/urls';
import moment from 'moment';
import {
	gdprConsentStatus,
	transferStatus,
	useMyDomainInputMode,
	type as domainTypes,
} from './constants';
import { isExpiringSoon } from './is-expiring-soon';
import { isRecentlyRegistered } from './is-recently-registered';
import {
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementTransfer,
	domainMappingSetup,
	domainUseMyDomain,
	domainManagementDNS,
} from './paths';
import { ResponseDomain } from './types';
import type { I18N, TranslateResult } from 'i18n-calypso';

export type ResolveDomainStatusReturn = {
	statusText: TranslateResult | TranslateResult[];
	statusClass:
		| 'status-error'
		| 'status-warning'
		| 'status-alert'
		| 'status-success'
		| 'status-neutral'
		| 'status-premium';
	status: TranslateResult;
	icon: 'info' | 'verifying' | 'check_circle' | 'cached' | 'cloud_upload' | 'download_done';
	listStatusWeight?: number;
	noticeText?: TranslateResult | Array< TranslateResult > | null;
	callToAction?: {
		href?: string;
		onClick?: React.MouseEventHandler< HTMLAnchorElement | HTMLButtonElement >;
		label: string;
	};
};

export type ResolveDomainStatusOptionsBag = {
	siteSlug?: string;
	currentRoute?: string | null;
	getMappingErrors?: boolean | null;
	translate: I18N[ 'translate' ];
	isPurchasedDomain?: boolean | null;
	onRenewNowClick?(): void;
	isCreditCardExpiring?: boolean | null;
	monthsUtilCreditCardExpires?: number | null;
	isVipSite?: boolean | null;
};

export type DomainStatusPurchaseActions = {
	isCreditCardExpiring?: ( domain: ResponseDomain ) => boolean;
	onRenewNowClick?: ( siteSlug: string, domain: ResponseDomain ) => void;
	isPurchasedDomain?: ( domain: ResponseDomain ) => boolean;
	monthsUtilCreditCardExpires?: ( domain: ResponseDomain ) => number | null;
};

export function resolveDomainStatus(
	domain: ResponseDomain,
	{
		siteSlug,
		getMappingErrors = false,
		currentRoute = null,
		translate,
		isPurchasedDomain = false,
		onRenewNowClick,
		isCreditCardExpiring = false,
		monthsUtilCreditCardExpires = null,
		isVipSite = false,
	}: ResolveDomainStatusOptionsBag
): ResolveDomainStatusReturn | null {
	const transferOptions = {
		components: {
			strong: <strong />,
			a: (
				<a
					href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS ) }
					rel="noopener noreferrer"
					target="_blank"
				/>
			),
		},
		args: {
			transferFinishDate: moment.utc( domain.transferEndDate ).format( 'LL' ),
		},
	};

	const mappingSetupCallToAction = {
		href: domainMappingSetup( siteSlug as string, domain.domain ),
		label: translate( 'Go to setup' ),
	};

	const paymentSetupCallToAction = {
		href: '/me/purchases/payment-methods',
		label: translate( 'Fix' ),
		onClick: ( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement, MouseEvent > ) =>
			e.stopPropagation(),
	};

	const editNameserversCallToAction = {
		href: domainManagementEdit( siteSlug as string, domain.domain, currentRoute, {
			nameservers: true,
		} ),
		label: translate( 'Point to WordPress.com' ),
		onClick: ( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement, MouseEvent > ) =>
			e.stopPropagation(),
	};

	const editDNSRecordsCallToAction = {
		href: domainManagementDNS( siteSlug as string, domain.domain ),
		label: translate( 'Point to WordPress.com' ),
		onClick: ( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement, MouseEvent > ) =>
			e.stopPropagation(),
	};

	switch ( domain.type ) {
		case domainTypes.MAPPED:
			if ( isExpiringSoon( domain, 30 ) ) {
				let callToAction;
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

				if ( ! isVipSite && ! domain.pointsToWpcom ) {
					noticeText = translate( "We noticed that something wasn't updated correctly." );
					callToAction = mappingSetupCallToAction;
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
					callToAction,
				};
			}

			if ( getMappingErrors && ! isVipSite ) {
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
						noticeText: translate( "We noticed that something wasn't updated correctly." ),
						callToAction: mappingSetupCallToAction,
						listStatusWeight: 1000,
					};
				}
			}

			return {
				statusText: translate( 'Active' ),
				statusClass: 'status-success',
				status: translate( 'Active' ),
				icon: 'check_circle',
			};

		case domainTypes.REGISTERED:
			if ( domain.aftermarketAuction ) {
				const statusMessage = translate( 'Expired', { context: 'domain status' } );
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
										href={ localizeUrl( DOMAIN_EXPIRATION_AUCTION ) }
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

			if (
				isPurchasedDomain &&
				isCreditCardExpiring &&
				monthsUtilCreditCardExpires &&
				monthsUtilCreditCardExpires < 3
			) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Action required' ),
					icon: 'info',
					noticeText: translate(
						'Your credit card expires before the next renewal. Please update your payment information.'
					),
					listStatusWeight: 600,
					callToAction: paymentSetupCallToAction,
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
							'We sent you an email to verify your contact information. Please complete the verification or your domain will stop working.',
							{
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
					callToAction: domain.currentUserIsOwner
						? {
								label: translate( 'Change address' ),
								href: domainManagementEditContactInfo(
									siteSlug as string,
									domain.name,
									currentRoute
								),
						  }
						: undefined,
					icon: 'info',
					listStatusWeight: 600,
				};
			}

			if ( domain.expired ) {
				let renewCta;

				const domainExpirationMessage = translate(
					'This domain expired on {{strong}}%(expiryDate)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
						},
						args: {
							expiryDate: moment.utc( domain.expiry ).format( 'LL' ),
						},
					}
				);

				const noticeText = [ domainExpirationMessage ];

				if ( domain.isRenewable ) {
					const renewableUntil = moment.utc( domain.renewableUntil ).format( 'LL' );

					if ( isPurchasedDomain && domain.currentUserIsOwner ) {
						noticeText.push( ' ' );
						noticeText.push(
							translate(
								'You can renew the domain at the regular rate until {{strong}}%(renewableUntil)s{{/strong}}.',
								{
									components: {
										strong: <strong />,
									},
									args: { renewableUntil },
								}
							)
						);

						renewCta = {
							onClick: onRenewNowClick,
							label: translate( 'Renew now' ),
						};
					} else {
						noticeText.push( ' ' );
						noticeText.push(
							translate(
								'The domain owner can renew the domain at the regular rate until {{strong}}%(renewableUntil)s{{/strong}}.',
								{
									components: {
										strong: <strong />,
									},
									args: { renewableUntil },
								}
							)
						);
					}
				} else if ( domain.isRedeemable ) {
					const redeemableUntil = moment.utc( domain.redeemableUntil ).format( 'LL' );

					if ( isPurchasedDomain && domain.currentUserIsOwner ) {
						noticeText.push( ' ' );
						noticeText.push(
							translate(
								'You can still renew the domain until {{strong}}%(redeemableUntil)s{{/strong}} by paying an additional redemption fee.',
								{
									components: {
										strong: <strong />,
									},
									args: { redeemableUntil },
								}
							)
						);

						renewCta = {
							onClick: onRenewNowClick,
							label: translate( 'Renew now' ),
						};
					} else {
						noticeText.push( ' ' );
						noticeText.push(
							translate(
								'The domain owner can still renew the domain until {{strong}}%(redeemableUntil)s{{/strong}} by paying an additional redemption fee.',
								{
									components: {
										strong: <strong />,
									},
									args: { redeemableUntil },
								}
							)
						);
					}
				}

				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Expired', { context: 'domain status' } ),
					icon: 'info',
					noticeText,
					callToAction: renewCta,
					listStatusWeight: 1000,
				};
			}

			if ( isExpiringSoon( domain, 30 ) ) {
				const domainExpirationMessage = translate(
					'This domain will expire on {{strong}}%(expiryDate)s{{/strong}}.',
					{
						args: { expiryDate: moment.utc( domain.expiry ).format( 'LL' ) },
						components: { strong: <strong /> },
					}
				);

				const expiresMessage = [ domainExpirationMessage ];

				let callToAction;

				if ( isPurchasedDomain && domain.currentUserIsOwner ) {
					callToAction = {
						onClick: onRenewNowClick,
						label: translate( 'Renew now' ),
					};
				} else {
					expiresMessage.push( ' ' );
					expiresMessage.push( translate( 'It can be renewed by the owner.' ) );
				}

				if ( isExpiringSoon( domain, 5 ) ) {
					return {
						statusText: domainExpirationMessage,
						statusClass: 'status-error',
						status: translate( 'Expiring soon' ),
						icon: 'info',
						noticeText: expiresMessage,
						callToAction,
						listStatusWeight: 1000,
					};
				}

				return {
					statusText: expiresMessage,
					statusClass: 'status-warning',
					status: translate( 'Expiring soon' ),
					icon: 'info',
					noticeText: expiresMessage,
					callToAction,
					listStatusWeight: 800,
				};
			}

			if ( isRecentlyRegistered( domain.registrationDate ) || domain.pendingRegistration ) {
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
						'{{strong}}Transfer successful!{{/strong}} To make this domain work with your WordPress.com site you need to {{cta}}point it to WordPress.com servers.{{/cta}}',
						{
							components: {
								strong: <strong />,
								cta: domain.hasWpcomNameservers ? (
									<a
										href={ domainManagementDNS( siteSlug as string, domain.domain ) }
										onClick={ ( e: React.MouseEvent< HTMLAnchorElement > ) => e.stopPropagation() }
									/>
								) : (
									<a
										href={ domainManagementEdit( siteSlug as string, domain.domain, currentRoute, {
											nameservers: true,
										} ) }
										onClick={ ( e: React.MouseEvent< HTMLAnchorElement > ) => e.stopPropagation() }
									/>
								),
							},
						}
					),
					callToAction: domain.hasWpcomNameservers
						? editDNSRecordsCallToAction
						: editNameserversCallToAction,
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
			if (
				isPurchasedDomain &&
				isCreditCardExpiring &&
				monthsUtilCreditCardExpires &&
				monthsUtilCreditCardExpires < 3
			) {
				return {
					statusText: translate( 'Action required' ),
					statusClass: 'status-error',
					status: translate( 'Action required' ),
					icon: 'info',
					noticeText: translate(
						'Your credit card expires before the next renewal. Please update your payment information.'
					),
					listStatusWeight: 600,
					callToAction: paymentSetupCallToAction,
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
			if ( domain.lastTransferError ) {
				const ctaLink = domainManagementTransfer( siteSlug as string, domain.domain, currentRoute );

				return {
					statusText: translate( 'Complete setup' ),
					statusClass: 'status-warning',
					status: translate( 'Complete setup' ),
					icon: 'info',
					noticeText: translate(
						'There was an error when initiating your domain transfer. Please {{a}}see the details or retry{{/a}}.',
						{
							components: {
								a: <a href={ ctaLink } />,
							},
						}
					),
					callToAction: {
						label: translate( 'Retry transfer' ),
						href: ctaLink,
					},
					listStatusWeight: 600,
				};
			}

			if ( domain.transferStatus === transferStatus.PENDING_START ) {
				return {
					statusText: translate( 'Complete setup' ),
					statusClass: 'status-warning',
					status: translate( 'Complete setup' ),
					icon: 'info',
					noticeText: translate( 'You need to start the domain transfer for your domain.' ),
					callToAction: {
						label: translate( 'Start transfer' ),
						href: domainUseMyDomain(
							siteSlug as string,
							domain.name,
							useMyDomainInputMode.startPendingTransfer
						),
					},
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
			return null;
	}
}
