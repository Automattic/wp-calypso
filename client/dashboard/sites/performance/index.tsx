import { PageHeader } from '@automattic/components/src/page-header';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function SitePerformance() {
	return (
		<PageLayout>
			<PageHeader title={ __( 'Performance' ) } level={ 1 } />
		</PageLayout>
	);
}

export default SitePerformance;
