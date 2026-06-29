import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainNameServersRoute } from '../../app/router/domains';
import { Notice } from '../../components/notice';
import type { Domain } from '@automattic/api-core';

interface DnsSecNameserversNoticeProps {
	domainName: string;
	domain: Domain;
}

/**
 * Warns that DNSSEC can't be enabled while the domain uses external name servers.
 *
 * DNSSEC can only be enabled when the domain uses WordPress.com name servers;
 * otherwise the request fails server-side with `domain_does_not_use_wpcom_ns`.
 * Returns `null` when DNSSEC is unsupported, already enabled, or the domain
 * already uses WordPress.com name servers.
 */
export const DnsSecNameserversNotice = ( { domainName, domain }: DnsSecNameserversNoticeProps ) => {
	if ( ! domain.is_dnssec_supported || domain.has_wpcom_nameservers || domain.is_dnssec_enabled ) {
		return null;
	}

	return (
		<Notice variant="warning" title={ __( 'Your domain is using external name servers' ) }>
			{ createInterpolateElement(
				__(
					'DNSSEC can only be enabled when your domain is using WordPress.com name servers. <updateNameServersLink>You can update your name servers here</updateNameServersLink>'
				),
				{
					updateNameServersLink: (
						<Link to={ domainNameServersRoute.fullPath } params={ { domainName } } />
					),
				}
			) }
		</Notice>
	);
};
