/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

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

function getAvailabilityNotice( domain, error, site ) {
	let message,
		severity = 'error';

	const tld = getTld( domain );

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
					'To use a domain ending with {{strong}}.%(tld)s{{/strong}} on your site, ' +
						'you can register it elsewhere first and then add it here. {{a}}Learn more{{/a}}.',
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
				message = translate(
					'Domains ending with {{strong}}.%(tld)s{{/strong}} are undergoing maintenance. Please check back shortly.',
					{
						args: { tld },
						components: {
							strong: <strong />,
						},
					}
				);
				severity = 'info';
			}
			break;
		case domainAvailability.MAPPABLE:
		case domainAvailability.AVAILABLE:
		case domainAvailability.PURCHASES_DISABLED:
		case domainAvailability.TLD_NOT_SUPPORTED:
		case domainAvailability.UNKNOWN:
		case domainAvailability.EMPTY_RESULTS:
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

function getAvailabilityNoticeForTransfers(
	domain,
	status,
	site,
	rootDomain,
	mappableStatus,
	goToMapDomainStep
) {
	let message,
		severity = 'error';

	const isSubDomain = rootDomain && rootDomain !== domain;

	switch ( status ) {
		case domainAvailability.MAPPABLE:
		case domainAvailability.TLD_NOT_SUPPORTED:
			if ( isSubDomain ) {
				message = translate(
					'Transferring a subdomain is not possible. You can try to {{button}}map it{{/button}} instead ' +
						'or transfer {{strong}}the root domain{{/strong}}.',
					{
						args: { rootDomain },
						components: {
							strong: <strong />,
							button: <button onClick={ goToMapDomainStep } />,
						},
					}
				);
			} else {
				const tld = getTld( domain );
				message = translate(
					"We don't support transfers for domains ending with {{strong}}.%(tld)s{{/strong}}, " +
						'but you can {{button}}map it{{/button}} instead.',
					{
						args: { tld },
						components: {
							strong: <strong />,
							button: <button onClick={ goToMapDomainStep } />,
						},
					}
				);
				severity = 'info';
			}
			break;
		case domainAvailability.UNKNOWN:
			if ( domainAvailability.MAPPABLE === mappableStatus ) {
				message = translate(
					"{{strong}}%(domain)s{{/strong}} can't be transferred. " +
						'You can {{button}}manually connect it{{/button}} if you still want to use it for your site.',
					{
						args: { domain },
						components: {
							strong: <strong />,
							button: <button onClick={ goToMapDomainStep } />,
						},
					}
				);
				severity = 'info';
				// The break is here intentionally so we can fallback to the default
				break;
			}
		default:
			( { message, severity } = getAvailabilityNotice( domain, status, site ) );
	}

	return {
		message,
		severity,
	};
}

function getOfferAvailabilityForSearchResults(
	lastDomainSearched,
	domain,
	rootDomain,
	isNextDomainFree,
	handleAddMapping,
	domainsWithPlansOnly,
	isSiteOnPaidPlan,
	domainMapCost,
	tldNotSupported
) {
	let offer, domainUnavailableMessage;
	const components = { button: <button onClick={ handleAddMapping } />, small: <small /> };
	const isSubDomain = rootDomain && rootDomain !== lastDomainSearched;

	if ( ! isSubDomain && isNextDomainFree ) {
		offer = translate(
			'{{small}}If you purchased %(domain)s elsewhere, you can {{button}}map it{{/button}} for free.{{/small}}',
			{ args: { domain }, components }
		);
	} else if ( ! isSubDomain && ( ! domainsWithPlansOnly || isSiteOnPaidPlan ) ) {
		offer = translate(
			'{{small}}If you purchased %(domain)s elsewhere, you can {{button}}map it{{/button}} for %(cost)s.{{/small}}',
			{ args: { domain, cost: domainMapCost }, components }
		);
	} else if ( ! isSubDomain ) {
		offer = translate(
			'{{small}}If you purchased %(domain)s elsewhere, you can {{button}}map it{{/button}} with WordPress.com Premium.{{/small}}',
			{ args: { domain }, components }
		);
	} else if ( isSubDomain && isNextDomainFree ) {
		offer = translate(
			'{{small}}If you own %(rootDomain)s, you can {{button}}map %(domain)s{{/button}} for free.{{/small}}',
			{ args: { rootDomain, domain }, components }
		);
	} else if ( isSubDomain && ( ! domainsWithPlansOnly || isSiteOnPaidPlan ) ) {
		offer = translate(
			'{{small}}If you own %(rootDomain)s, you can {{button}}map %(domain)s{{/button}} for %(cost)s.{{/small}}',
			{ args: { rootDomain, domain, cost: domainMapCost }, components }
		);
	} else {
		offer = translate(
			'{{small}}If you own %(rootDomain)s, you can {{button}}map %(domain)s{{/button}} with WordPress.com Premium.{{/small}}',
			{ args: { rootDomain, domain }, components }
		);
	}

	if ( isSubDomain ) {
		domainUnavailableMessage = translate( '{{strong}}%(domain)s{{/strong}} is a subdomain.', {
			args: { domain },
			components: { strong: <strong /> },
		} );
	} else if ( tldNotSupported ) {
		domainUnavailableMessage = translate(
			'{{strong}}.%(tld)s{{/strong}} domains are not offered on WordPress.com.',
			{
				args: { tld: getTld( domain ) },
				components: { strong: <strong /> },
			}
		);
	} else {
		domainUnavailableMessage = translate( '{{strong}}%(domain)s{{/strong}} is taken.', {
			args: { domain },
			components: { strong: <strong /> },
		} );
	}

	return { offer, domainUnavailableMessage };
}

export {
	getAvailabilityNotice,
	getAvailabilityNoticeForTransfers,
	getOfferAvailabilityForSearchResults,
};
