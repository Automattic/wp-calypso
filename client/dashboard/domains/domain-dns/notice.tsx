import { DomainSubtype, Domain } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainNameServersRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';

interface DomainDnsNameserversNoticeProps {
	domainName: string;
	domain: Domain;
}

export const DomainDnsNameserversNotice = ( {
	domainName,
	domain,
}: DomainDnsNameserversNoticeProps ) => {
	if ( domain.has_wpcom_nameservers ) {
		return null;
	}

	if ( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		return (
			<Notice variant="warning" title={ __( 'Your domain is using external name servers' ) }>
				{ createInterpolateElement(
					__(
						'This means that the DNS records you’re editing won’t be in effect until you switch to use WordPress.com name servers. <learnMoreLink />'
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
					'This means that the DNS records you’re editing won’t be in effect until you switch to use WordPress.com name servers. <updateNameServersLink>You can update your name servers here</updateNameServersLink>'
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
