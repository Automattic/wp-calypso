import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SitePerformance() {
	return (
		<PageLayout header={ <PageHeader title={ __( 'Performance' ) } /> }>
			<Card>
				<CardBody>
					<></>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default SitePerformance;
