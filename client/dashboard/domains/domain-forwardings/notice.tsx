import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainQuery } from '../../app/queries/domain';
import { domainNameServersRoute, siteDomainsRoute } from '../../app/router';

interface DomainForwardingNoticeProps {
	domainName: string;
}

export const DomainForwardingNotice = ( { domainName }: DomainForwardingNoticeProps ) => {
	const { data: domainData } = useSuspenseQuery( domainQuery( domainName ) );

	const usesDefaultNameservers = domainData?.has_wpcom_nameservers;
	const isPrimaryDomain = domainData?.primary_domain;
	const isDomainOnly = domainData?.is_domain_only_site;
	const siteSlug = domainData?.site_slug;

	// TODO: Should the first notice link to the domain mapping setup page???
	// That's how it works in client/my-sites/domains/domain-management/settings/index.tsx
	// but I'm not sure how useful that is if at all???

	// TODO: The second link is to set a primary domain for a site, but I'm not sure if that'll be the correct link - check it once it's clear what the correct link is
	if ( ! usesDefaultNameservers ) {
		return (
			<Notice status="warning" isDismissible={ false }>
				{ createInterpolateElement(
					__(
						"Your domain is using external name servers so the Domain Forwarding records you're editing won't be in effect until you switch to use WordPress.com name servers. <link>Update your name servers now</link>."
					),
					{
						link: <Link to={ domainNameServersRoute.fullPath } params={ { domainName } } />,
					}
				) }
			</Notice>
		);
	} else if ( isPrimaryDomain && ! isDomainOnly ) {
		return (
			<Notice status="info" isDismissible={ false }>
				{ createInterpolateElement(
					__(
						"This domain is your site's main address. You can forward subdomains or <link>set a new primary site address</link> to forward the root domain."
					),
					{
						link: <Link to={ siteDomainsRoute.fullPath } params={ { siteSlug } } />,
					}
				) }
			</Notice>
		);
	}

	return null;
};
