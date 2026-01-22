import { DomainSubtype, Domain } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainDnsRoute, domainNameServersRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';

interface DnsRequirementsNoticeProps {
	domainName: string;
	domainData: Domain | undefined;
}

export const DnsRequirementsNotice = ( { domainName, domainData }: DnsRequirementsNoticeProps ) => {
	if ( ! domainData || domainData.has_wpcom_nameservers ) {
		return null;
	}

	if ( domainData.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		return (
			<Notice variant="warning" title={ __( 'DNS configuration required' ) }>
				{ createInterpolateElement(
					__(
						'Your domain is using external name servers. To set up email forwarding, you need to configure MX records in your DNS settings. <learnMoreLink />'
					),
					{
						learnMoreLink: (
							<InlineSupportLink supportContext="dns-default-mx-records">
								{ __( 'Learn more about MX records' ) }
							</InlineSupportLink>
						),
					}
				) }
			</Notice>
		);
	}

	return (
		<Notice variant="warning" title={ __( 'DNS configuration required' ) }>
			{ createInterpolateElement(
				__(
					'Your domain is using external name servers. To set up email forwarding, you need to configure MX records in your DNS settings. <dnsLink>Manage DNS records</dnsLink> or <nameServersLink>switch to WordPress.com name servers</nameServersLink>. <learnMoreLink />'
				),
				{
					dnsLink: (
						<Link to={ domainDnsRoute.fullPath } params={ { domainName } }>
							{ __( 'Manage DNS records' ) }
						</Link>
					),
					nameServersLink: (
						<Link to={ domainNameServersRoute.fullPath } params={ { domainName } }>
							{ __( 'switch to WordPress.com name servers' ) }
						</Link>
					),
					learnMoreLink: (
						<InlineSupportLink supportContext="dns-default-mx-records">
							{ __( 'Learn more about MX records' ) }
						</InlineSupportLink>
					),
				}
			) }
		</Notice>
	);
};
