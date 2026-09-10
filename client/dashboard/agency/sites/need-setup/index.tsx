import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function AgencySitesNeedSetup() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Needs setup' ) }
					description={ __( 'Set up the sites you have purchased but not yet configured.' ) }
				/>
			}
		>
			{ /* TODO: Build the needs setup site list. */ }
		</PageLayout>
	);
}
