import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SitePerformance() {
	return (
		<PageLayout>
			<PageHeader title={ __( 'Performance' ) } />
		</PageLayout>
	);
}

export default SitePerformance;
