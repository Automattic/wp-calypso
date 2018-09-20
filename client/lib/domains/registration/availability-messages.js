/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { getTld } from 'lib/domains';
import {
	CALYPSO_CONTACT,
	INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
	MAP_EXISTING_DOMAIN,
} from 'lib/url/support';
import { domainAvailability } from 'lib/domains/constants';
import {
	domainManagementTransferToOtherSite,
	domainManagementTransferIn,
	domainTransferIn,
} from 'my-sites/domains/paths';

function getAvailabilityNotice( domain, error, errorData ) {
	const tld = domain ? getTld( domain ) : null;
	const { site, maintenanceEndTime } = errorData || {};

	// The message is set only when there is a valid error
	// and the conditions of the corresponding switch block are met.
	// Consumers should check for the message prop in order
	// to determine whether to display the notice
	// See for e.g., client/components/domains/register-domain-step/index.jsx
	let message,
		severity = 'error';

	switch ( error ) {
		case domainAvailability.REGISTERED:
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
		case domainAvailability.REGISTERED_SAME_SITE:
			message = translate( '{{strong}}%(domain)s{{/strong}} is already registered on this site.', {
				args: { domain },
				components: {
					strong: <strong />,
				},
			} );
			break;
		case domainAvailability.REGISTERED_OTHER_SITE_SAME_USER:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already registered on your site %(site)s. Do you want to move it to this site? ' +
					'{{a}}Yes, move it to this site.{{/a}}',
				{
					args: { domain, site },
					components: {
						strong: <strong />,
						a: (
							<a
								rel="noopener noreferrer"
								href={ domainManagementTransferToOtherSite( site, domain ) }
							/>
						),
					},
				}
			);
			break;
		case domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already connected to this site, but registered somewhere else. Do you want to move ' +
					'it from your current domain provider to WordPress.com so you can manage the domain and the site ' +
					'together? {{a}}Yes, transfer it to WordPress.com.{{/a}}',
				{
					args: { domain },
					components: {
						strong: <strong />,
						a: <a rel="noopener noreferrer" href={ domainTransferIn( site, domain ) } />,
					},
				}
			);
			break;
		case domainAvailability.MAPPED_SAME_SITE_NOT_TRANSFERRABLE:
			message = translate( '{{strong}}%(domain)s{{/strong}} is already connected to this site.', {
				args: { domain },
				components: {
					strong: <strong />,
				},
			} );
			break;
		case domainAvailability.MAPPED_OTHER_SITE_SAME_USER:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is already connected to your site %(site)s. If you want to connect it to this site ' +
					'instead, we will be happy to help you do that. {{a}}Contact us.{{/a}}',
				{
					args: { domain, site },
					components: {
						strong: <strong />,
						a: <a rel="noopener noreferrer" href={ CALYPSO_CONTACT } />,
					},
				}
			);
			break;
		case domainAvailability.TRANSFER_PENDING_SAME_USER:
			message = translate(
				'{{strong}}%(domain)s{{/strong}} is pending transfer. {{a}}Check the transfer status{{/a}} to learn more.',
				{
					args: { domain },
					components: {
						strong: <strong />,
						a: <a rel="noopener noreferrer" href={ domainManagementTransferIn( site, domain ) } />,
					},
				}
			);
			break;
		case domainAvailability.TRANSFER_PENDING:
			message = translate(
				"{{strong}}%(domain)s{{/strong}} is pending transfer and can't be connected to WordPress.com right now. " +
					'{{a}}Learn More.{{/a}}',
				{
					args: { domain },
					components: {
						strong: <strong />,
						a: (
							<a rel="noopener noreferrer" href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS } />
						),
					},
				}
			);
			break;
		case domainAvailability.NOT_REGISTRABLE:
			if ( tld ) {
				message = translate(
					'To use this domain on your site, you can register it elsewhere first and then add it here. {{a}}Learn more{{/a}}.',
					{
						args: { tld },
						components: {
							strong: <strong />,
							a: <a rel="noopener noreferrer" href={ MAP_EXISTING_DOMAIN } />,
						},
					}
				);
				severity = 'info';
			}
			break;
		case domainAvailability.MAINTENANCE:
			if ( tld ) {
				let maintenanceEnd = translate( 'shortly', {
					comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
				} );
				if ( maintenanceEndTime ) {
					maintenanceEnd = moment.unix( maintenanceEndTime ).fromNow();
				}

				message = translate(
					'Domains ending with {{strong}}.%(tld)s{{/strong}} are undergoing maintenance. Please ' +
						'try a different extension or check back %(maintenanceEnd)s.',
					{
						args: {
							tld,
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
		case domainAvailability.PURCHASES_DISABLED:
			let maintenanceEnd = translate( 'shortly', {
				comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
			} );
			if ( maintenanceEndTime ) {
				maintenanceEnd = moment.unix( maintenanceEndTime ).fromNow();
			}

			message = translate(
				'Domains registration is unavailable at this time. Please select a free WordPress.com ' +
					'domain or check back %(maintenanceEnd)s.',
				{
					args: { maintenanceEnd },
				}
			);
			severity = 'info';
			break;

		case domainAvailability.MAPPABLE:
		case domainAvailability.AVAILABLE:
		case domainAvailability.TLD_NOT_SUPPORTED:
		case domainAvailability.TLD_NOT_SUPPORTED_TEMPORARILY:
		case domainAvailability.UNKNOWN:
		case domainAvailability.EMPTY_RESULTS:
			// unavailable domains are displayed in the search results, not as a notice OR
			// domain registrations are closed, in which case it is handled in parent
			break;

		case domainAvailability.BLACKLISTED:
			if ( domain && domain.toLowerCase().indexOf( 'wordpress' ) > -1 ) {
				message = translate(
					'Due to {{a1}}trademark policy{{/a1}}, ' +
						'we are not able to allow domains containing {{strong}}WordPress{{/strong}} to be registered or mapped here. ' +
						'Please {{a2}}contact support{{/a2}} if you have any questions.',
					{
						components: {
							strong: <strong />,
							a1: (
								<a
									rel="noopener noreferrer"
									href="http://wordpressfoundation.org/trademark-policy/"
								/>
							),
							a2: <a href={ CALYPSO_CONTACT } />,
						},
					}
				);
			} else {
				message = translate(
					'Domain cannot be mapped to a WordPress.com blog because of blacklisted term.'
				);
			}
			break;

		case domainAvailability.FORBIDDEN_SUBDOMAIN:
			message = translate(
				"Subdomains starting with 'www.' cannot be mapped to a WordPress.com blog"
			);
			break;

		case domainAvailability.FORBIDDEN:
			message = translate( 'Only the owner of the domain can map its subdomains.' );
			break;

		case domainAvailability.INVALID_TLD:
		case domainAvailability.INVALID:
			message = translate( 'Sorry, %(domain)s does not appear to be a valid domain name.', {
				args: { domain: domain },
			} );
			break;

		case domainAvailability.MAPPED:
			message = translate( 'This domain is already mapped to a WordPress.com site.' );
			break;

		case domainAvailability.DOTBLOG_SUBDOMAIN:
		case domainAvailability.RESTRICTED:
			message = translate(
				'You cannot map another WordPress.com subdomain - try creating a new site or one of the custom domains below.'
			);
			break;

		case domainAvailability.RECENTLY_UNMAPPED:
			message = translate(
				'This domain was recently in use by someone else and is not available to map yet. ' +
					'Please try again later or contact support.'
			);
			break;

		case domainAvailability.RECENTLY_EXPIRED:
			message = translate(
				'This domain expired recently. To get it back please {{a}}contact support{{/a}}.',
				{
					components: {
						a: <a href={ CALYPSO_CONTACT } />,
					},
				}
			);
			break;

		case domainAvailability.UNKOWN_ACTIVE:
			message = translate(
				'This domain is still active and is not available to map yet. ' +
					'Please try again later or contact support.'
			);
			break;

		case domainAvailability.EMPTY_QUERY:
			message = translate( 'Please enter a domain name or keyword.' );
			break;

		case domainAvailability.INVALID_QUERY:
			message = translate(
				'Your search term can only contain alphanumeric characters, spaces, dots, or hyphens.'
			);
			break;

		default:
			message = translate(
				'Sorry, there was a problem processing your request. Please try again in a few minutes.'
			);
	}

	return {
		message,
		severity,
	};
}

export { getAvailabilityNotice };
