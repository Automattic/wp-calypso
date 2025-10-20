import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesLanguageForm from '../preferences-language';
import PreferencesLogin from '../preferences-login';
import PreferencesNewHostingDashboard from '../preferences-new-hosting-dashboard';

export default function Preferences() {
	const { optIn } = useAppContext();

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Preferences' ) } /> }>
			{ optIn && <PreferencesNewHostingDashboard /> }
			<PreferencesLanguageForm />
			<PreferencesLogin />
		</PageLayout>
	);
}
