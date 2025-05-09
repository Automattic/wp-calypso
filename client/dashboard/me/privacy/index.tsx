import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function Privacy() {
	return (
		<PageLayout
			title={ __( 'Privacy' ) }
			description={ __( 'Manage your privacy settings.' ) }
			size="small"
		/>
	);
}

export default Privacy;
