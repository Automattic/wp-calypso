import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { Panel } from 'calypso/components/panel';
import { useAreAdvancedHostingFeaturesSupported } from '../../hosting-features/features';
import DefensiveModeForm from './defensive-mode-form';
import ServerConfigurationForm from './server-configuration-form';

import './style.scss';

export default function WebServerSettings() {
	const translate = useTranslate();

	const isSupported = useAreAdvancedHostingFeaturesSupported();
	if ( isSupported === null ) {
		return null;
	}

	const renderNotSupportedNotice = () => {
		return (
			<>
				<Notice showDismiss={ false } status="is-warning">
					{ translate( 'This setting is not supported for this site.' ) }
				</Notice>
			</>
		);
	};

	const renderSetting = () => {
		return (
			<>
				<ServerConfigurationForm />
				<DefensiveModeForm />
			</>
		);
	};

	return (
		<Panel className="settings-web-server">
			<NavigationHeader
				title={ translate( 'Web server' ) }
				subtitle={ translate(
					'For sites with specialized needs, fine-tune how the web server runs your website.'
				) }
			/>
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</Panel>
	);
}
