import { __ } from '@wordpress/i18n';
import { securityRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function Security() {
	return (
		<PageLayout size="small">
			<PageHeader
				title={ securityRoute.options.staticData.label() }
				description={ __( 'Manage your security settings.' ) }
			/>
		</PageLayout>
	);
}

export default Security;
