import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import SiteTools from 'calypso/my-sites/site-settings/site-tools';
import { SOURCE_SETTINGS_ADMINISTRATION } from 'calypso/my-sites/site-settings/site-tools/utils';
import useIsAdministrationSettingSupported from './hooks/use-is-administration-setting-supported';

export default function AdministrationSettings() {
	const translate = useTranslate();
	const isSupported = useIsAdministrationSettingSupported();

	const renderNotSupportedNotice = () => {
		return (
			<Notice showDismiss={ false } status="is-warning">
				{ translate( 'This setting is not supported for staging sites.' ) }
			</Notice>
		);
	};

	const renderSetting = () => {
		return <SiteTools source={ SOURCE_SETTINGS_ADMINISTRATION } />;
	};

	return (
		<div className="administration-settings">
			<NavigationHeader title={ translate( 'Administration' ) } />
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</div>
	);
}
