import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DpaCard from './dpa-card';
import UsageInformationCard from './usage-information-card';

export default function Privacy() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Privacy' ) } /> }>
			<VStack spacing={ 8 }>
				<UsageInformationCard />
				<DpaCard />
			</VStack>
		</PageLayout>
	);
}
