import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainQuery } from '../../app/queries/domain';
import { domainRoute } from '../../app/router/domains';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import NameServersSettingsSummary from '../name-servers/summary';

export default function DomainOverviewSettings() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Settings' ) } level={ 3 } />
			<SummaryButtonList>
				<NameServersSettingsSummary domain={ domain } />
			</SummaryButtonList>
		</VStack>
	);
}
