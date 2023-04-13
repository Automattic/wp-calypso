import { connect } from 'react-redux';
import GeneralForm from 'calypso/my-sites/site-settings/form-general';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import P2PreapprovedDomainsForm from './settings-p2/preapproved-domains';
import SiteTools from './site-tools';

const SiteSettingsGeneral = ( { site, isWPForTeamsSite, isP2Hub, isWpcomStagingSite } ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		{ isWPForTeamsSite && isP2Hub && <P2PreapprovedDomainsForm siteId={ site?.ID } /> }
		{ ! isWpcomStagingSite && <SiteTools /> }
	</div>
);

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	return {
		site: site,
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isP2Hub: isSiteP2Hub( state, siteId ),
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
	};
} )( SiteSettingsGeneral );
