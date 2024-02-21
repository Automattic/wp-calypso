import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import GeneralForm from 'calypso/my-sites/site-settings/form-general';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import P2PreapprovedDomainsForm from './settings-p2/preapproved-domains';
import SiteTools from './site-tools';
import { SOURCE_SETTINGS_GENERAL } from './site-tools/utils';

const getHeaderTitle = ( isAdminInterface ) => {
	if ( isAdminInterface ) {
		return translate( 'Other tools' );
	}
	return translate( 'Site tools' );
};

const SiteSettingsGeneral = ( {
	site,
	isWPForTeamsSite,
	isP2Hub,
	isWpcomStagingSite,
	isAdminInterface,
} ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		{ isWPForTeamsSite && isP2Hub && <P2PreapprovedDomainsForm siteId={ site?.ID } /> }
		{ ! isWpcomStagingSite && (
			<SiteTools
				headerTitle={ getHeaderTitle( isAdminInterface ) }
				source={ SOURCE_SETTINGS_GENERAL }
			/>
		) }
	</div>
);

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const adminInterface = getSiteOption( state, siteId, 'wpcom_admin_interface' );
	return {
		site: site,
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isP2Hub: isSiteP2Hub( state, siteId ),
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
		isAdminInterface: adminInterface,
	};
} )( SiteSettingsGeneral );
