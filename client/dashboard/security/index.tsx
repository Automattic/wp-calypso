import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function Security() {
	return (
		<PageLayout title={ __( 'Security' ) } description={ __( 'Manage your security settings.' ) } />
	);
}

export default Security;
