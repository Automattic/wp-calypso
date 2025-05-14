import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function Privacy() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Privacy' ) } description={ __( 'Manage your privacy settings.' ) } />
		</PageLayout>
	);
}

export default Privacy;
