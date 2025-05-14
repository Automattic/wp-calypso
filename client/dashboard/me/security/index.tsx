import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function Security() {
	return (
		<PageLayout
			title={ __( 'Security' ) }
			description={ __( 'Manage your security settings.' ) }
			size="small"
		/>
	);
}

export default Security;
