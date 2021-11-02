import config from '@automattic/calypso-config';
import { connect } from 'react-redux';
import GeneralForm from 'calypso/my-sites/site-settings/form-general';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import P2PreapprovedDomainsForm from './settings-p2/preapproved-domains';
import SiteTools from './site-tools';

const SiteSettingsGeneral = ( { site, isWPForTeamsSite, isP2HubSite } ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		{ isWPForTeamsSite && isP2HubSite && config.isEnabled( 'p2/settings/preapproved-domains' ) && (
			<P2PreapprovedDomainsForm site={ site } />
		) }
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
