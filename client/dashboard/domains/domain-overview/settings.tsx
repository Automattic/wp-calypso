import { domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainRoute } from '../../app/router/domains';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import DomainContactDetailsSettingsSummary from '../domain-contact-details/summary';
import DnsSettingsSummary from '../domain-dns/summary';
import DomainForwardingsSettingsSummary from '../domain-forwardings/summary';
import DomainSecuritySettingsSummary from '../domain-security/summary';
import NameServersSettingsSummary from '../name-servers/summary';
import DomainGlueRecordsSettingsSummary from '../overview-glue-records/summary';

export default function DomainOverviewSettings() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Settings' ) } level={ 3 } />
			<SummaryButtonList>
				<NameServersSettingsSummary domain={ domain } />
				<DnsSettingsSummary domain={ domain } />
				<DomainForwardingsSettingsSummary domain={ domain } />
				<DomainContactDetailsSettingsSummary domain={ domain } />
				<DomainSecuritySettingsSummary domain={ domain } />
				<DomainGlueRecordsSettingsSummary domain={ domain } />
			</SummaryButtonList>
		</VStack>
	);
}
