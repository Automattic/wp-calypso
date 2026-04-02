import { isEnabled } from '@automattic/calypso-config';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PreferencesAiMcp from '../preferences-ai-mcp';
import PreferencesBlockedSites from '../preferences-blocked-sites';
import PreferencesDefaults from '../preferences-defaults';
import PreferencesLanguage from '../preferences-language';
import PreferencesNewHostingDashboard from '../preferences-new-hosting-dashboard';
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
			<VStack spacing={ 4 }>
				{ optIn && <PreferencesNewHostingDashboard /> }
				{ isEnabled( 'mcp-settings' ) && <PreferencesAiMcp /> }
				<PreferencesLanguage />
				<PreferencesDefaults />
				<PreferencesPrivacy />
				{ supports.reader && <PreferencesBlockedSites /> }
			</VStack>
		</PageLayout>
	);
}
