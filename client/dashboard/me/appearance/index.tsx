import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import AppearanceControl from '../../components/appearance-control';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function Appearance() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Appearance' ) }
					description={ __( 'Customize the appearance.' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<AppearanceControl source="preferences_appearance" />
				</CardBody>
			</Card>
		</PageLayout>
	);
}
