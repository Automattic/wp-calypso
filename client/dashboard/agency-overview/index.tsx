import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

export default function AgencyOverview() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Agency Overview' ) }
					actions={
						<>
							<Button variant="primary" __next40pxDefaultSize>
								{ __( 'Add Sites' ) }
							</Button>
							<Button variant="secondary" __next40pxDefaultSize>
								{ __( 'Add Products' ) }
							</Button>
						</>
					}
					description={ __( 'This is a sample overview page.' ) }
				/>
			}
		></PageLayout>
	);
}
