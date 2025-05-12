import { PageHeader } from '@automattic/components/src/page-header';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function Security() {
	return (
		<PageLayout size="small">
			<PageHeader
				title={ __( 'Security' ) }
				description={ __( 'Manage your security settings.' ) }
				level={ 1 }
			/>
		</PageLayout>
	);
}

export default Security;
