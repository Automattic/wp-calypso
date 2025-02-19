import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import JetpackMonitor from 'calypso/my-sites/site-settings/form-jetpack-monitor';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import DefensiveModeForm from './defensive-mode-form';
import ServerConfigurationForm from './server-configuration-form';

import './style.scss';

export default function ServerSettings() {
	const translate = useTranslate();
	const isJetpack = useSelectedSiteSelector( isJetpackSite );

	return (
		<Panel className="settings-server">
			<NavigationHeader
				title={ translate( 'Server settings' ) }
				subtitle={ translate(
					'For sites with specialized needs, fine-tune how the web server runs your website.'
				) }
			/>
			<ServerConfigurationForm />
			<DefensiveModeForm />
			{ isJetpack && <JetpackMonitor /> }
		</Panel>
	);
}
