import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JetpackFediverseSettingsSection } from './JetpackFediverseSettingsSection';
import { WpcomFediverseSettingsSection } from './WpcomFediverseSettingsSection';

export const FediverseSettingsSection = () => {
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const translate = useTranslate();

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Fediverse settings' ) } />
			{ isJetpack ? (
				<JetpackFediverseSettingsSection siteId={ siteId } />
			) : (
				<WpcomFediverseSettingsSection siteId={ siteId } />
			) }
		</>
	);
};
