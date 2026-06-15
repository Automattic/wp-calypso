import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function SecurityLegacyContact() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Legacy contact' ) }
					description={ __(
						'A legacy contact is someone you trust to have access to your account after your death.'
					) }
				/>
			}
		>
			{ /* Content goes here */ }
		</PageLayout>
	);
}
