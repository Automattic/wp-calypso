import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	CALYPSO_HELP_WITH_HELP_CENTER,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	INCOMING_DOMAIN_TRANSFER_SUPPORTED_TLDS,
	MAP_EXISTING_DOMAIN,
	PREMIUM_DOMAINS,
} from '@automattic/urls';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import moment from 'moment';
import { DomainSearchEvents } from '../page/types';

interface NoticeData {
	message: React.ReactNode;
	severity: 'error' | 'info';
}

export const getAvailabilityNotice = (
	domain: string,
	availabilityData: DomainAvailability,
	events: DomainSearchEvents,
	currentSiteUrl?: string
): NoticeData | null => {
	let message: React.ReactNode;
	let severity: 'error' | 'info' = 'error';

	switch ( availabilityData.status ) {
		case DomainAvailabilityStatus.REGISTERED:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__( '<strong>%(domain)s</strong> is already connected to a WordPress.com site.' ),
					{
						domain,
					}
				),
				{
					strong: <strong />,
				}
			);

			break;
		case DomainAvailabilityStatus.REGISTERED_SAME_SITE:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						'<strong>%(domain)s</strong> is already registered on this site. <button>Are you trying to make this the primary address for your site?</button>'
					),
					{
						domain,
					}
				),
				{
					strong: <strong />,
					button: <button onClick={ () => events.onMakePrimaryAddressClick( domain ) } />,
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER:
			if ( availabilityData.other_site_domain ) {
				if ( currentSiteUrl ) {
					if ( availabilityData.other_site_domain_only ) {
						message = createInterpolateElement(
							sprintf(
								/* translators: %(domain)s is the domain name */
								__(
									'<strong>%(domain)s</strong> is already registered as a domain-only site. Do you want to <button>move it to this site</button>?'
								),
								{
									domain,
								}
							),
							{
								strong: <strong />,
								button: (
									<button
										onClick={ () =>
											events.onMoveDomainToSiteClick( availabilityData.other_site_domain!, domain )
										}
									/>
								),
							}
						);
					} else {
						message = createInterpolateElement(
							sprintf(
								/* translators: %(domain)s is the domain name, %(site)s is the other site domain */
								__(
									'<strong>%(domain)s</strong> is already registered on your site %(site)s. Do you want to <button>move it to this site</button>?'
								),
								{
									domain,
									site: availabilityData.other_site_domain!,
								}
							),
							{
								strong: <strong />,
								button: (
									<button
										onClick={ () =>
											events.onMoveDomainToSiteClick( availabilityData.other_site_domain!, domain )
										}
									/>
								),
							}
						);
					}
				} else if ( availabilityData.other_site_domain_only ) {
					message = createInterpolateElement(
						sprintf(
							/* translators: %(domain)s is the domain name */
							__( '<strong>%(domain)s</strong> is already registered as a domain-only site.' ),
							{
								domain,
							}
						),
						{
							strong: <strong />,
						}
					);
				} else {
					message = createInterpolateElement(
						sprintf(
							/* translators: %(domain)s is the domain name, %(site)s is the other site domain */
							__( '<strong>%(domain)s</strong> is already registered on your site %(site)s.' ),
							{
								domain,
								site: availabilityData.other_site_domain!,
							}
						),
						{
							strong: <strong />,
						}
					);
				}
			} else {
				message = createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name */
						__( '<strong>%(domain)s</strong> is already registered on another site you own.' ),
						{
							domain,
						}
					),
					{
						strong: <strong />,
					}
				);
			}
			severity = 'info';
			break;
		case DomainAvailabilityStatus.IN_REDEMPTION:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						'<strong>%(domain)s</strong> is not eligible to register or transfer since it is in <redemptionLink>redemption</redemptionLink>. If you own this domain, please contact your current registrar to <aboutRenewingLink>redeem the domain</aboutRenewingLink>.'
					),
					{
						domain,
					}
				),
				{
					strong: <strong />,
					redemptionLink: (
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.icann.org/resources/pages/grace-2013-05-03-en"
						/>
					),
					aboutRenewingLink: (
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.icann.org/news/blog/do-you-have-a-domain-name-here-s-what-you-need-to-know-part-5"
						/>
					),
				}
			);
			break;
		case DomainAvailabilityStatus.CONFLICTING_CNAME_EXISTS:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						'There is an existing CNAME for <strong>%(domain)s</strong>. If you want to connect this subdomain, you should remove the conflicting CNAME DNS record first.'
					),
					{
						domain,
					}
				),
				{
					strong: <strong />,
				}
			);
			break;
		case DomainAvailabilityStatus.MAPPED_SAME_SITE_TRANSFERRABLE:
			if ( currentSiteUrl ) {
				message = createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name */
						__(
							'<strong>%(domain)s</strong> is already connected to this site, but registered somewhere else. Do you want to move ' +
								'it from your current domain provider to WordPress.com so you can manage the domain and the site ' +
								'together? <button>Yes, transfer it to WordPress.com.</button>'
						),
						{
							domain,
						}
					),
					{
						strong: <strong />,
						button: (
							<button onClick={ () => events.onMoveDomainToSiteClick( currentSiteUrl!, domain ) } />
						),
					}
				);
				severity = 'info';
				break;
			}
		case DomainAvailabilityStatus.MAPPED_SAME_SITE_NOT_TRANSFERRABLE:
			if ( availabilityData.cannot_transfer_due_to_unsupported_premium_tld ) {
				message = createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name, %(tld)s is the TLD */
						__(
							'<strong>%(domain)s</strong> is already connected to this site and cannot be transferred to WordPress.com because premium domain transfers for the %(tld)s TLD are not supported. <a>Learn more</a>.'
						),
						{
							domain,
							tld: availabilityData.tld,
						}
					),
					{
						strong: <strong />,
						a: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								href={ localizeUrl( PREMIUM_DOMAINS ) }
							/>
						),
					}
				);
				break;
			}

			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						'<strong>%(domain)s</strong> is already connected to this site and cannot be transferred to WordPress.com. <a>Learn more</a>.'
					),
					{
						domain,
					}
				),
				{
					strong: <strong />,
					a: (
						<a
							target="_blank"
							rel="noopener noreferrer"
							href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_SUPPORTED_TLDS ) }
						/>
					),
				}
			);
			break;
		case DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name, %(site)s is the other site domain */
					__(
						'<strong>%(domain)s</strong> is already connected to your site %(site)s. If you want to connect it to this site ' +
							'instead, we will be happy to help you do that. <a>Contact us</a>.'
					),
					{
						domain,
						site: availabilityData.other_site_domain!,
					}
				),
				{
					strong: <strong />,
					a: <a target="_blank" rel="noopener noreferrer" href={ CALYPSO_HELP_WITH_HELP_CENTER } />,
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name, %(site)s is the other site domain */
					__(
						'<strong>%(domain)s</strong> is already connected to your site %(site)s.' +
							' <button>Register it to the connected site</button>.'
					),
					{
						domain,
						site: availabilityData.other_site_domain!,
					}
				),
				{
					strong: <strong />,
					button: (
						<button
							onClick={ () =>
								events.onRegisterDomainClick( availabilityData.other_site_domain!, domain )
							}
						/>
					),
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.TRANSFER_PENDING_SAME_USER:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						'<strong>%(domain)s</strong> is pending transfer. <button>Check the transfer status</button> to learn more.'
					),
					{
						domain,
					}
				),
				{
					strong: <strong />,
					button: <button onClick={ () => events.onCheckTransferStatusClick( domain ) } />,
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.TRANSFER_PENDING:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						"<strong>%(domain)s</strong> is pending transfer and can't be connected to WordPress.com right now. <a>Learn more</a>."
					),
					{
						domain,
					}
				),
				{
					strong: <strong />,
					a: (
						<a
							target="_blank"
							rel="noopener noreferrer"
							href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS ) }
						/>
					),
				}
			);
			break;
		case DomainAvailabilityStatus.NOT_REGISTRABLE:
			if ( availabilityData.tld ) {
				message = createInterpolateElement(
					__(
						'To use this domain on your site, you can register it elsewhere first and then add it here. <a>Learn more</a>.'
					),
					{
						a: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								href={ localizeUrl( MAP_EXISTING_DOMAIN ) }
							/>
						),
					}
				);
				severity = 'info';
			}
			break;
		case DomainAvailabilityStatus.MAINTENANCE:
			if ( availabilityData.tld ) {
				let maintenanceEnd = __( 'shortly' );
				if ( availabilityData.maintenance_end_time ) {
					maintenanceEnd = moment
						.unix( parseInt( availabilityData.maintenance_end_time, 10 ) )
						.fromNow();
				}

				message = createInterpolateElement(
					sprintf(
						/* translators: %(tld)s is the TLD */
						__(
							'Domains ending with <strong>.%(tld)s</strong> are undergoing maintenance. Please ' +
								'try a different extension or check back %(maintenanceEnd)s.'
						),
						{
							tld: availabilityData.tld,
							maintenanceEnd,
						}
					),
					{
						strong: <strong />,
					}
				);
				severity = 'info';
			}
			break;
		case DomainAvailabilityStatus.PURCHASES_DISABLED: {
			let maintenanceEnd = __( 'shortly' );
			if ( availabilityData.maintenance_end_time ) {
				maintenanceEnd = moment
					.unix( parseInt( availabilityData.maintenance_end_time, 10 ) )
					.fromNow();
			}

			message = sprintf(
				/* translators: %(maintenanceEnd)s is the maintenance end time */
				__(
					'Domain registration is unavailable at this time. Please select a free subdomain ' +
						'or check back %(maintenanceEnd)s.'
				),
				{
					maintenanceEnd,
				}
			);
			severity = 'info';
			break;
		}

		case DomainAvailabilityStatus.EMPTY_RESULTS:
			message = __(
				"Sorry, we weren't able to generate any domain name suggestions for that search term. Please try a different set of keywords."
			);
			break;

		case DomainAvailabilityStatus.INVALID_TLD:
		case DomainAvailabilityStatus.INVALID:
			message = sprintf(
				/* translators: %(domain)s is the domain name */
				__( 'Sorry, %(domain)s does not appear to be a valid domain name.' ),
				{
					domain,
				}
			);
			break;

		case DomainAvailabilityStatus.RECENTLY_EXPIRED:
			message = createInterpolateElement(
				__( 'This domain expired recently. To get it back please <a>contact support</a>.' ),
				{
					a: <a target="_blank" href={ CALYPSO_HELP_WITH_HELP_CENTER } rel="noreferrer" />,
				}
			);
			break;

		case DomainAvailabilityStatus.DOMAIN_SUGGESTIONS_THROTTLED:
			message = __(
				'You have made too many domain suggestions requests in a short time. Please wait a few minutes and try again.'
			);
			break;

		case DomainAvailabilityStatus.AVAILABLE_PREMIUM:
			if ( currentSiteUrl ) {
				message = createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name */
						__(
							"Sorry, <strong>%(domain)s</strong> is a premium domain. We don't support purchasing this premium domain on WordPress.com, but if you purchase the domain elsewhere, you can <button>connect it to your site</button>."
						),
						{
							domain,
						}
					),
					{
						strong: <strong />,
						button: <button onClick={ () => events.onMapDomainClick( domain ) } />,
					}
				);
			} else {
				message = createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is the domain name */
						__(
							"Sorry, <strong>%(domain)s</strong> is a premium domain. We don't support purchasing this premium domain on WordPress.com."
						),
						{
							domain,
						}
					),
					{
						strong: <strong />,
					}
				);
			}
			break;

		case DomainAvailabilityStatus.AVAILABLE_RESERVED:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name, %(tld)s is the TLD */
					__(
						'Sorry, <strong>%(domain)s</strong> is reserved by the .%(tld)s registry and cannot be registered without permission.'
					),
					{
						domain,
						tld: availabilityData.tld,
					}
				),
				{
					strong: <strong />,
				}
			);
			break;

		case DomainAvailabilityStatus.INVALID_LENGTH:
			message = __( 'The domain name is too long.' );
			break;

		case DomainAvailabilityStatus.DOMAIN_AVAILABILITY_THROTTLED:
			message = createInterpolateElement(
				sprintf(
					/* translators: %(domain)s is the domain name */
					__(
						"Unfortunately we're unable to check the status of <strong>%(domain)s</strong> at this moment. Please log in first or try again later."
					),
					{
						domain,
					}
				),
				{ strong: <strong /> }
			);
			break;
	}

	if ( ! message ) {
		return null;
	}

	return {
		message,
		severity,
	};
};
