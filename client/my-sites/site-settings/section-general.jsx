import { connect } from 'react-redux';
import GeneralForm from 'calypso/my-sites/site-settings/form-general';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import P2GeneralSettingsForm from './settings-p2';
import SiteTools from './site-tools';

const SiteSettingsGeneral = ( { site, isWPForTeamsSite, isP2HubSite } ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		{ isWPForTeamsSite && isP2HubSite && <P2GeneralSettingsForm site={ site } /> }
		<SiteTools />
	</div>
);

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		site: getSelectedSite( state ),
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isP2HubSite: isSiteP2Hub( state, siteId ),
	};
} )( SiteSettingsGeneral );
