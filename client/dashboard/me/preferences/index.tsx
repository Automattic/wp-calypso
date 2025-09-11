import { __ } from '@wordpress/i18n';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesLanguageForm from '../preferences-language';
import PreferencesNewHostingDashboard from '../preferences-new-hosting-dashboard';

export default function Preferences() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Preferences' ) } /> }>
			<FlashMessage value="dashboard" message={ __( 'Successfuilly saved preference.' ) } />
			<PreferencesNewHostingDashboard />
			<PreferencesLanguageForm />
		</PageLayout>
	);
}
