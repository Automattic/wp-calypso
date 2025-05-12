import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

export default function AgencyOverview() {
	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Agency Overview' ) }
				actions={ [
					<Button key="add-sites" variant="primary" __next40pxDefaultSize>
						{ __( 'Add Sites' ) }
					</Button>,
					<Button key="add-products" variant="secondary" __next40pxDefaultSize>
						{ __( 'Add Products' ) }
					</Button>,
				] }
				description={ __( 'This is a sample overview page.' ) }
				level={ 1 }
			/>
		</PageLayout>
	);
}
