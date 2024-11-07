import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { useAreAdvancedHostingFeaturesSupported } from 'calypso/sites/features';
import DefensiveModeForm from './defensive-mode-form';
import WebServerSettingsForm from './web-server-form';

import './style.scss';

function WebServerSettingsContainer( { children }: { children: React.ReactNode } ) {
	return children;
}

function WebServerSettingsDescription( { children }: { children?: React.ReactNode } ) {
	const translate = useTranslate();
	return <NavigationHeader title={ translate( 'Web server' ) } subtitle={ children } />;
}

function DefensiveModeContainer( { children }: { children: React.ReactNode } ) {
	const translate = useTranslate();
	return (
		<>
			<h2 className="defensive-mode__heading">{ translate( 'Defensive mode' ) }</h2>
			{ children }
		</>
	);
}

function DefensiveModeDescription( { children }: { children?: React.ReactNode } ) {
	return <div className="defensive-mode__description">{ children }</div>;
}

export default function WebServerSettings() {
	const translate = useTranslate();

	const isSupported = useAreAdvancedHostingFeaturesSupported();
	if ( isSupported === null ) {
		return null;
	}

	const renderNotSupportedNotice = () => {
		return (
			<>
				<WebServerSettingsDescription />
				<Notice showDismiss={ false } status="is-warning">
					{ translate( 'This setting is not supported for this site.' ) }
				</Notice>
			</>
		);
	};

	const renderSetting = () => {
		return (
			<>
				<WebServerSettingsForm
					disabled={ false }
					ContainerComponent={ WebServerSettingsContainer }
					DescriptionComponent={ WebServerSettingsDescription }
				/>
				<hr />
				<DefensiveModeForm
					disabled={ false }
					ContainerComponent={ DefensiveModeContainer }
					DescriptionComponent={ DefensiveModeDescription }
				/>
			</>
		);
	};

	return (
		<div className="settings-web-server">
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</div>
	);
}
