import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function Preferences() {
	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Preferences' ) }
				description={ __( 'Manage your account preferences and settings.' ) }
			/>
			<div className="preferences-sections">
			</div>
		</PageLayout>
	);
}
