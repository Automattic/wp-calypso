import { isEnabled } from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesAiMcp from '../preferences-ai-mcp';
import PreferencesBlockedSites from '../preferences-blocked-sites';
import PreferencesDefaultLanding from '../preferences-default-landing';
import PreferencesLanguageForm from '../preferences-language';
import PreferencesNewHostingDashboard from '../preferences-new-hosting-dashboard';
import PreferencesPrimarySite from '../preferences-primary-site';
import PreferencesPrivacy from '../preferences-privacy';

export default function Preferences() {
	const { optIn, supports } = useAppContext();

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
			{ isEnabled( 'mcp-settings' ) && <PreferencesAiMcp /> }
			{ supports.reader && <PreferencesBlockedSites /> }
			{ !! supports.me && supports.me.privacy && <PreferencesPrivacy /> }
			{ optIn && <PreferencesNewHostingDashboard /> }
			<PreferencesLanguageForm />
			<PreferencesPrimarySite />
			<PreferencesDefaultLanding />
		</PageLayout>
	);
}
