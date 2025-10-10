import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	CALYPSO_HELP_WITH_HELP_CENTER,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	INCOMING_DOMAIN_TRANSFER_SUPPORTED_TLDS,
	MAP_EXISTING_DOMAIN,
	PREMIUM_DOMAINS,
} from '@automattic/urls';
import { translate } from 'i18n-calypso';
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
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already connected to a WordPress.com site.',
				{
					args: { domain },
					components: {
						strong: <strong />,
					},
				}
			);
			break;
		case DomainAvailabilityStatus.REGISTERED_SAME_SITE:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already registered on this site. {{button}}Are you trying to make this the primary address for your site?{{/button}}',
				{
					args: { domain },
					components: {
						strong: <strong />,
						button: <button onClick={ () => events.onMakePrimaryAddressClick( domain ) } />,
					},
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER:
			if ( availabilityData.other_site_domain ) {
				const messageOptions = {
					args: { domain, site: availabilityData.other_site_domain! },
					components: {
						strong: <strong />,
						button: (
							<button
								onClick={ () =>
									events.onMoveDomainToSiteClick( availabilityData.other_site_domain!, domain )
								}
							/>
						),
					},
				};
				if ( availabilityData.other_site_domain_only ) {
					message = translate(
						'{{strong}}%(domain)s{{/strong}} is already registered as a domain-only site. Do you want to {{button}}move it to this site{{/button}}?',
						messageOptions
					);
				} else {
					message = translate(
						'{{strong}}%(domain)s{{/strong}} is already registered on your site %(site)s. Do you want to {{button}}move it to this site{{/button}}?',
						messageOptions
					);
				}
			} else {
				message = translate(
					'{{strong}}%(domain)s{{/strong}} is already registered on another site you own.',
					{
						args: { domain },
						components: {
							strong: <strong />,
						},
					}
				);
			}
			severity = 'info';
			break;
		case DomainAvailabilityStatus.IN_REDEMPTION:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is not eligible to register or transfer since it is in {{redemptionLink}}redemption{{/redemptionLink}}. If you own this domain, please contact your current registrar to {{aboutRenewingLink}}redeem the domain{{/aboutRenewingLink}}.',
				{
					args: { domain },
					components: {
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
					},
				}
			);
			break;
		case DomainAvailabilityStatus.CONFLICTING_CNAME_EXISTS:
			message = translate(
				'There is an existing CNAME for {{strong}}%(domain)s{{/strong}}. If you want to connect this subdomain, you should remove the conflicting CNAME DNS record first.',
				{
					args: { domain },
					components: {
						strong: <strong />,
					},
				}
			);
			break;
		case DomainAvailabilityStatus.MAPPED_SAME_SITE_TRANSFERRABLE:
			if ( currentSiteUrl ) {
				message = translate(
					'{{strong}}%(domain)s{{/strong}} is already connected to this site, but registered somewhere else. Do you want to move ' +
						'it from your current domain provider to WordPress.com so you can manage the domain and the site ' +
						'together? {{button}}Yes, transfer it to WordPress.com.{{/button}}',
					{
						args: { domain },
						components: {
							strong: <strong />,
							button: (
								<button
									onClick={ () => events.onMoveDomainToSiteClick( currentSiteUrl!, domain ) }
								/>
							),
						},
					}
				);
				severity = 'info';
				break;
			}
		case DomainAvailabilityStatus.MAPPED_SAME_SITE_NOT_TRANSFERRABLE:
			if ( availabilityData.cannot_transfer_due_to_unsupported_premium_tld ) {
				message = translate(
					'{{strong}}%(domain)s{{/strong}} is already connected to this site and cannot be transferred to WordPress.com because premium domain transfers for the %(tld)s TLD are not supported. {{a}}Learn more{{/a}}.',
					{
						args: {
							domain,
							tld: availabilityData.tld,
						},
						components: {
							strong: <strong />,
							a: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									href={ localizeUrl( PREMIUM_DOMAINS ) }
								/>
							),
						},
					}
				);
				break;
			}

			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already connected to this site and cannot be transferred to WordPress.com. {{a}}Learn more{{/a}}.',
				{
					args: { domain },
					components: {
						strong: <strong />,
						a: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_SUPPORTED_TLDS ) }
							/>
						),
					},
				}
			);
			break;
		case DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already connected to your site %(site)s. If you want to connect it to this site ' +
					'instead, we will be happy to help you do that. {{a}}Contact us.{{/a}}',
				{
					args: { domain, site: availabilityData.other_site_domain! },
					components: {
						strong: <strong />,
						a: (
							<a target="_blank" rel="noopener noreferrer" href={ CALYPSO_HELP_WITH_HELP_CENTER } />
						),
					},
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already connected to your site %(site)s.' +
					' {{button}}Register it to the connected site.{{/button}}',
				{
					args: { domain, site: availabilityData.other_site_domain! },
					components: {
						strong: <strong />,
						button: (
							<button
								onClick={ () =>
									events.onRegisterDomainClick( availabilityData.other_site_domain!, domain )
								}
							/>
						),
					},
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.TRANSFER_PENDING_SAME_USER:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is pending transfer. {{button}}Check the transfer status{{/button}} to learn more.',
				{
					args: { domain },
					components: {
						strong: <strong />,
						button: <button onClick={ () => events.onCheckTransferStatusClick( domain ) } />,
					},
				}
			);
			severity = 'info';
			break;
		case DomainAvailabilityStatus.TRANSFER_PENDING:
			message = translate(
				"{{strong}}%(domain)s{{/strong}} is pending transfer and can't be connected to WordPress.com right now. " +
					'{{a}}Learn More.{{/a}}',
				{
					args: { domain },
					components: {
						strong: <strong />,
						a: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS ) }
							/>
						),
					},
				}
			);
			break;
		case DomainAvailabilityStatus.NOT_REGISTRABLE:
			if ( availabilityData.tld ) {
				message = translate(
					'To use this domain on your site, you can register it elsewhere first and then add it here. {{a}}Learn more{{/a}}.',
					{
						args: { tld: availabilityData.tld },
						components: {
							strong: <strong />,
							a: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									href={ localizeUrl( MAP_EXISTING_DOMAIN ) }
								/>
							),
						},
					}
				);
				severity = 'info';
			}
			break;
		case DomainAvailabilityStatus.MAINTENANCE:
			if ( availabilityData.tld ) {
				let maintenanceEnd = translate( 'shortly', {
					comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
				} );
				if ( availabilityData.maintenance_end_time ) {
					maintenanceEnd = moment
						.unix( parseInt( availabilityData.maintenance_end_time, 10 ) )
						.fromNow();
				}

				message = translate(
					'Domains ending with {{strong}}.%(tld)s{{/strong}} are undergoing maintenance. Please ' +
						'try a different extension or check back %(maintenanceEnd)s.',
					{
						args: {
							tld: availabilityData.tld,
							maintenanceEnd,
						},
						components: {
							strong: <strong />,
						},
					}
				);
				severity = 'info';
			}
			break;
		case DomainAvailabilityStatus.PURCHASES_DISABLED: {
			let maintenanceEnd = translate( 'shortly', {
				comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
			} );
			if ( availabilityData.maintenance_end_time ) {
				maintenanceEnd = moment
					.unix( parseInt( availabilityData.maintenance_end_time, 10 ) )
					.fromNow();
			}

			message = translate(
				'Domain registration is unavailable at this time. Please select a free subdomain ' +
					'or check back %(maintenanceEnd)s.',
				{
					args: { maintenanceEnd },
				}
			);
			severity = 'info';
			break;
		}

		case DomainAvailabilityStatus.UNKNOWN:
			// unavailable domains are displayed in the search results, not as a notice OR
			// domain registrations are closed, in which case it is handled in parent
			break;

		case DomainAvailabilityStatus.EMPTY_RESULTS:
			message = translate(
				"Sorry, we weren't able to generate any domain name suggestions for that search term. Please try a different set of keywords."
			);
			break;

		case DomainAvailabilityStatus.DISALLOWED:
			if ( domain && domain.toLowerCase().indexOf( 'wordpress' ) > -1 ) {
				message = translate(
					'Due to {{a1}}trademark policy{{/a1}}, ' +
						'we are not able to allow domains containing {{strong}}WordPress{{/strong}} to be registered or connected here. ' +
						'Please {{a2}}contact support{{/a2}} if you have any questions.',
					{
						components: {
							strong: <strong />,
							a1: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									href="http://wordpressfoundation.org/trademark-policy/"
								/>
							),
							a2: <a target="_blank" href={ CALYPSO_HELP_WITH_HELP_CENTER } rel="noreferrer" />,
						},
					}
				);
			} else {
				message = translate(
					'Domain cannot be connected to a WordPress.com blog because of disallowed term.'
				);
			}
			break;

		case DomainAvailabilityStatus.FORBIDDEN_SUBDOMAIN:
			message = translate(
				"Subdomains starting with 'www.' cannot be connected to a WordPress.com blog"
			);
			break;

		case DomainAvailabilityStatus.FORBIDDEN:
			message = translate( 'Only the owner of the domain can connect its subdomains.' );
			break;

		case DomainAvailabilityStatus.WPCOM_STAGING_DOMAIN:
			message = translate( 'This domain is a reserved WordPress.com staging domain' );
			break;

		case DomainAvailabilityStatus.INVALID_TLD:
		case DomainAvailabilityStatus.INVALID:
			message = translate( 'Sorry, %(domain)s does not appear to be a valid domain name.', {
				args: { domain: domain },
			} );
			break;

		case DomainAvailabilityStatus.MAPPED:
			message = translate( 'This domain is already connected to a WordPress.com site.' );
			break;

		case DomainAvailabilityStatus.DOTBLOG_SUBDOMAIN:
		case DomainAvailabilityStatus.RESTRICTED:
			message = translate(
				'This is a free WordPress.com subdomain. You can’t connect it to another site.'
			);
			break;

		case DomainAvailabilityStatus.RECENTLY_UNMAPPED:
			message = translate(
				'This domain was recently in use by someone else and is not available to connect yet. ' +
					'Please try again later or contact support.'
			);
			break;

		case DomainAvailabilityStatus.RECENTLY_EXPIRED:
			message = translate(
				'This domain expired recently. To get it back please {{a}}contact support{{/a}}.',
				{
					components: {
						a: <a target="_blank" href={ CALYPSO_HELP_WITH_HELP_CENTER } rel="noreferrer" />,
					},
				}
			);
			break;

		case DomainAvailabilityStatus.UNKOWN_ACTIVE:
			message = translate(
				'This domain is still active and is not available to connect yet. ' +
					'Please try again later or contact support.'
			);
			break;

		case DomainAvailabilityStatus.EMPTY_QUERY:
			message = translate( 'Please enter a domain name or keyword.' );
			break;

		case DomainAvailabilityStatus.INVALID_QUERY:
			message = translate(
				'Your search term can only contain alphanumeric characters, spaces, dots, or hyphens.'
			);
			break;

		case DomainAvailabilityStatus.AVAILABILITY_CHECK_ERROR:
			message = translate(
				'Sorry, an error occurred when checking the availability of this domain. Please try again in a few minutes.'
			);
			break;

		case DomainAvailabilityStatus.DOMAIN_SUGGESTIONS_THROTTLED:
			message = translate(
				'You have made too many domain suggestions requests in a short time. Please wait a few minutes and try again.'
			);
			break;

		case DomainAvailabilityStatus.AVAILABLE_PREMIUM:
			if ( currentSiteUrl ) {
				message = translate(
					"Sorry, {{strong}}%(domain)s{{/strong}} is a premium domain. We don't support purchasing this premium domain on WordPress.com, but if you purchase the domain elsewhere, you can {{button}}connect it to your site{{/button}}.",
					{
						args: { domain },
						components: {
							strong: <strong />,
							button: <button onClick={ () => events.onMapDomainClick( domain ) } />,
						},
					}
				);
			} else {
				message = translate(
					"Sorry, {{strong}}%(domain)s{{/strong}} is a premium domain. We don't support purchasing this premium domain on WordPress.com.",
					{
						args: { domain },
						components: {
							strong: <strong />,
						},
					}
				);
			}
			break;

		case DomainAvailabilityStatus.AVAILABLE_RESERVED:
			message = translate(
				'Sorry, {{strong}}%(domain)s{{/strong}} is reserved by the .%(tld)s registry and cannot be registered without permission.',
				{
					args: { domain, tld: availabilityData.tld },
					components: {
						strong: <strong />,
					},
				}
			);
			break;

		case DomainAvailabilityStatus.RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE:
			message = translate(
				"Sorry, {{strong}}%(domain)s{{/strong}} can't be transferred because it was registered less than 60 days ago.",
				{
					args: { domain },
					components: {
						strong: <strong />,
					},
				}
			);
			break;

		case DomainAvailabilityStatus.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE:
			message = translate(
				"Sorry, {{strong}}%(domain)s{{/strong}} can't be transferred due to a transfer lock at the registry.",
				{
					args: { domain },
					components: {
						strong: <strong />,
					},
				}
			);
			break;

		case DomainAvailabilityStatus.INVALID_LENGTH:
			message = translate( 'The domain name is too long.' );
			break;

		case DomainAvailabilityStatus.DOMAIN_AVAILABILITY_THROTTLED:
			message = translate(
				"Unfortunately we're unable to check the status of {{strong}}%(domain)s{{/strong}} at this moment. Please log in first or try again later.",
				{
					args: { domain },
					components: {
						strong: <strong />,
					},
				}
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
