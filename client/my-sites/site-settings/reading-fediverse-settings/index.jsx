import { useSelector } from 'react-redux';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JetpackFediverseSettingsSection } from './JetpackFediverseSettingsSection';
import { WpcomFediverseSettingsSection } from './WpcomFediverseSettingsSection';

export const FediverseSettingsSection = () => {
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	if ( isJetpack ) {
		return <JetpackFediverseSettingsSection siteId={ siteId } />;
	}

	return <WpcomFediverseSettingsSection siteId={ siteId } />;
};
