import { DomainSubtype, Domain } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainNameServersRoute } from '../../app/router/domains';
import { siteDomainsRoute } from '../../app/router/sites';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';

interface DomainForwardingNoticeProps {
	domainName: string;
	domainData: Domain;
}

export const DomainForwardingNotice = ( {
	domainName,
	domainData,
}: DomainForwardingNoticeProps ) => {
	if ( ! domainData?.has_wpcom_nameservers ) {
		if ( domainData.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
			return (
				<Notice variant="warning" title={ __( 'Your domain is using external name servers' ) }>
					{ createInterpolateElement(
						__(
							'This means that the Domain Forwarding records you’re editing won’t be in effect until you switch to use WordPress.com name servers. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="map-domain-update-name-servers" />,
						}
					) }
				</Notice>
			);
		}
		return (
			<Notice variant="warning" title={ __( 'Your domain is using external name servers' ) }>
				{ createInterpolateElement(
					__(
						'This means that the Domain Forwarding records you’re editing won’t be in effect until you switch to use WordPress.com name servers. <link>You can update your name servers here</link>'
					),
					{
						link: <Link to={ domainNameServersRoute.fullPath } params={ { domainName } } />,
					}
				) }
			</Notice>
		);
	} else if ( domainData?.primary_domain && ! domainData?.is_domain_only_site ) {
		return (
			<Notice variant="info">
				{ createInterpolateElement(
					__(
						'This domain is your site’s main address. You can forward subdomains or <link>set a new primary site address</link> to forward the root domain.'
					),
					{
						link: (
							<Link
								to={ siteDomainsRoute.fullPath }
								params={ { siteSlug: domainData?.site_slug } }
							/>
						),
					}
				) }
			</Notice>
		);
	}

	return null;
};
