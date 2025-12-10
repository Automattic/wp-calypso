import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesDefaultLanding from '../preferences-default-landing';
import PreferencesLanguageForm from '../preferences-language';
import PreferencesNewHostingDashboard from '../preferences-new-hosting-dashboard';
import PreferencesPrimarySite from '../preferences-primary-site';

export default function Preferences() {
	const { optIn } = useAppContext();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Preferences' ) }
					description={ __( 'Customize your account preferences and settings.' ) }
				/>
			}
		>
			{ optIn && <PreferencesNewHostingDashboard /> }
			<PreferencesLanguageForm />
			<PreferencesPrimarySite />
			<PreferencesDefaultLanding />
		</PageLayout>
	);
}
