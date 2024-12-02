import { useTranslate } from 'i18n-calypso';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { Panel } from 'calypso/components/panel';
import { SOURCE_SETTINGS_ADMINISTRATION } from 'calypso/my-sites/site-settings/site-tools/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useIsAdministrationSettingSupported from './hooks/use-is-administration-setting-supported';
import AdministrationTools from './tools';

export default function AdministrationSettings() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isSupported = useIsAdministrationSettingSupported();

	const renderNotSupportedNotice = () => {
		return (
			<Notice showDismiss={ false } status="is-warning">
				{ translate( 'This setting is not supported for staging sites.' ) }
			</Notice>
		);
	};

	const renderSetting = () => {
		return (
			<>
				<QuerySitePurchases siteId={ siteId } />
				<AdministrationTools source={ SOURCE_SETTINGS_ADMINISTRATION } />
			</>
		);
	};

	return (
		<Panel className="settings-administration">
			<NavigationHeader title={ translate( 'Administration' ) } />
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</Panel>
	);
}
