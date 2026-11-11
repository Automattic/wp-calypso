import { DomainSubtype, Domain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { domainDnsRoute, domainNameServersRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import Notice, { RouterNoticeActionLink } from '../../components/notice';

interface DnsRequirementsNoticeProps {
	domainName: string;
	domainData: Domain;
}

export const DnsRequirementsNotice = ( { domainName, domainData }: DnsRequirementsNoticeProps ) => {
	if ( domainData.has_wpcom_nameservers ) {
		return null;
	}

	if ( domainData.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		return (
			<Notice
				variant="warning"
				title={ __( 'DNS configuration required' ) }
				actions={
					<InlineSupportLink supportContext="dns-default-mx-records">
						{ __( 'Learn more about MX records' ) }
					</InlineSupportLink>
				}
			>
				{ __(
					'Your domain is using external name servers. To set up email forwarding, you need to configure MX records in your DNS settings.'
				) }
			</Notice>
		);
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'DNS configuration required' ) }
			actions={
				<>
					<RouterNoticeActionLink to={ domainDnsRoute.fullPath } params={ { domainName } }>
						{ __( 'Manage DNS records' ) }
					</RouterNoticeActionLink>
					<RouterNoticeActionLink to={ domainNameServersRoute.fullPath } params={ { domainName } }>
						{ __( 'Switch to WordPress.com name servers' ) }
					</RouterNoticeActionLink>
					<InlineSupportLink supportContext="dns-default-mx-records">
						{ __( 'Learn more about MX records' ) }
					</InlineSupportLink>
				</>
			}
		>
			{ __(
				'Your domain is using external name servers. To set up email forwarding, you need to configure MX records in your DNS settings.'
			) }
		</Notice>
	);
};
