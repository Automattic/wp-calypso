import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesLanguageForm from '../preferences-language';
import PreferencesLogin from '../preferences-login';
import PreferencesNewHostingDashboard from '../preferences-new-hosting-dashboard';

export default function Preferences() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Preferences' ) } /> }>
			<PreferencesNewHostingDashboard />
			<PreferencesLanguageForm />
			<PreferencesLogin />
		</PageLayout>
	);
}
