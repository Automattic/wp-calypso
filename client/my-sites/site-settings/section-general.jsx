import { isEnabled } from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import GeneralForm from 'calypso/my-sites/site-settings/form-general';
import SiteTools from 'calypso/sites/settings/administration/tools';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import P2PreapprovedDomainsForm from './settings-p2/preapproved-domains';
import { SOURCE_SETTINGS_GENERAL } from './site-tools/utils';

const SiteSettingsGeneral = ( { site, isWPForTeamsSite, isP2Hub, isWpcomStagingSite } ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		{ isWPForTeamsSite && isP2Hub && <P2PreapprovedDomainsForm siteId={ site?.ID } /> }
		{ ! isWpcomStagingSite && ! isEnabled( 'untangling/hosting-menu' ) && (
			<SiteTools headerTitle={ translate( 'Site tools' ) } source={ SOURCE_SETTINGS_GENERAL } />
		) }
		{ isEnabled( 'untangling/hosting-menu' ) && (
			<Notice
				showDismiss={ false }
				status="is-info"
				text={ translate(
					'Privacy, site tools, and other settings have moved to the hosting dashboard.'
				) }
			>
				<NoticeAction href={ `/sites/settings/site/${ site.domain }` } external>
					{ translate( 'View settings' ) }
				</NoticeAction>
			</Notice>
		) }
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
