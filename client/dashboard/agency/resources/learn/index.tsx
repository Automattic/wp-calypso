import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import SampleResourceGrid from './sample-resource-grid';

export default function Learn() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Library' ) }
					description={ __( 'Resources to help you learn, win clients, and deliver great work.' ) }
				/>
			}
		>
			<SampleResourceGrid />
		</PageLayout>
	);
}
