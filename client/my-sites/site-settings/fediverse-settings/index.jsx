import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JetpackFediverseSettingsSection } from './JetpackFediverseSettingsSection';
import { WpcomFediverseSettingsSection } from './WpcomFediverseSettingsSection';

export const FediverseServiceSection = ( { needsBorders = true } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	return (
		<>
			{ isJetpack ? (
				<JetpackFediverseSettingsSection siteId={ siteId } needsBorders={ needsBorders } />
			) : (
				<WpcomFediverseSettingsSection siteId={ siteId } needsBorders={ needsBorders } />
			) }
		</>
	);
};

export const FediverseSettingsSection = () => {
	const translate = useTranslate();

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Fediverse settings' ) } />
			<FediverseServiceSection />
		</>
	);
};
