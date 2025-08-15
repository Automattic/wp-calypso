import { useSuspenseQuery } from '@tanstack/react-query';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainQuery } from '../../app/queries/domain';

interface DomainForwardingNoticeProps {
	domainName: string;
}

export const DomainForwardingNotice = ( { domainName }: DomainForwardingNoticeProps ) => {
	const { data: domainData } = useSuspenseQuery( domainQuery( domainName ) );

	const usesDefaultNameservers = domainData?.has_wpcom_nameservers;
	const isPrimaryDomain = domainData?.primary_domain;
	const isDomainOnly = domainData?.is_domain_only_site;

	if ( ! usesDefaultNameservers ) {
		return (
			<Notice status="warning" isDismissible={ false }>
				{ __(
					"Your domain is using external name servers so the Domain Forwarding records you're editing won't be in effect until you switch to use WordPress.com name servers. Update your name servers now."
				) }
			</Notice>
		);
	} else if ( isPrimaryDomain && ! isDomainOnly ) {
		return (
			<Notice status="info" isDismissible={ false }>
				{ __(
					"This domain is your site's main address. You can forward subdomains or set a new primary site address to forward the root domain."
				) }
			</Notice>
		);
	}

	return null;
};
