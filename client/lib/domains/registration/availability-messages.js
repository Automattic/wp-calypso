/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getTld } from 'lib/domains';
import support from 'lib/url/support';
import { domainAvailability } from 'lib/domains/constants';

function getAvailabilityNotice( domain, error ) {
	let message,
		severity = 'error';

	const tld = getTld( domain );

	switch ( error ) {
		case domainAvailability.NOT_REGISTRABLE:
			if ( tld ) {
				message = translate(
					'To use a domain ending with {{strong}}.%(tld)s{{/strong}} on your site, ' +
					'you can register it elsewhere first and then add it here. {{a}}Learn more{{/a}}.',
					{
						args: { tld },
						components: {
							strong: <strong />,
							a: <a target="_blank" rel="noopener noreferrer" href={ support.MAP_EXISTING_DOMAIN } />
						}
					}
				);
				severity = 'info';
			}
			break;
		case domainAvailability.MAINTENANCE:
			if ( tld ) {
				message = translate(
					'Domains ending with {{strong}}.%(tld)s{{/strong}} are undergoing maintenance. Please check back shortly.',
					{
						args: { tld },
						components: {
							strong: <strong />
						}
					}
				);
				severity = 'info';
			}
			break;
		case domainAvailability.MAPPABLE:
		case domainAvailability.AVAILABLE:
		case domainAvailability.PURCHASES_DISABLED:
		case domainAvailability.UNKNOWN:
			// unavailable domains are displayed in the search results, not as a notice OR
			// domain registrations are closed, in which case it is handled in parent
			message = null;
			break;

		case domainAvailability.BLACKLISTED:
			if ( domain.toLowerCase().indexOf( 'wordpress' ) > -1 ) {
				message = translate(
					'Due to {{a1}}trademark policy{{/a1}}, ' +
					'we are not able to allow domains containing {{strong}}WordPress{{/strong}} to be registered or mapped here. ' +
					'Please {{a2}}contact support{{/a2}} if you have any questions.',
					{
						components: {
							strong: <strong />,
							a1: <a target="_blank" rel="noopener noreferrer" href="http://wordpressfoundation.org/trademark-policy/" />,
							a2: <a href={ support.CALYPSO_CONTACT } />
						}
					}
				);
			} else {
				message = translate( 'Domain cannot be mapped to a WordPress.com blog because of blacklisted term.' );
			}
			break;

		case domainAvailability.FORBIDDEN_SUBDOMAIN:
			message = translate( 'Subdomains starting with \'www.\' cannot be mapped to a WordPress.com blog' );
			break;

		case domainAvailability.FORBIDDEN:
			message = translate( 'Only the owner of the domain can map its subdomains.' );
			break;

		case domainAvailability.INVALID_TLD:
		case domainAvailability.INVALID:
			message = translate( 'Sorry, %(domain)s does not appear to be a valid domain name.', {
				args: { domain: domain }
			} );
			break;

		case domainAvailability.MAPPED:
			message = translate( 'This domain is already mapped to a WordPress.com site.' );
			break;

		case domainAvailability.RESTRICTED:
			message = translate(
				'You cannot map another WordPress.com subdomain - try creating a new site or one of the custom domains below.'
			);
			break;

		case domainAvailability.RECENTLY_UNMAPPED:
			message = translate( 'This domain was recently in use by someone else and is not available to map yet. ' +
				'Please try again later or contact support.' );
			break;

		case domainAvailability.EMPTY_QUERY:
			message = translate( 'Please enter a domain name or keyword.' );
			break;

		default:
			message = translate( 'Sorry, there was a problem processing your request. Please try again in a few minutes.' );
	}

	return {
		message,
		severity
	};
}

export {
	getAvailabilityNotice
};
