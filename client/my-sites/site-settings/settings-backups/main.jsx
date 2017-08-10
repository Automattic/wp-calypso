/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import SiteSettingsFormBackups from 'my-sites/site-settings/form-backups';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackMonitor from 'my-sites/site-settings/form-jetpack-monitor';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import Placeholder from 'my-sites/site-settings/placeholder';
import QueryRewindStatus from 'components/data/query-rewind-status';

const SiteSettingsBackups = ( { site, siteId, siteIsJetpack, activityLogRequest, translate } ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	return (
		<Main className="settings-backups__main site-settings">
			<QueryRewindStatus siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="backups" />
			<SiteSettingsFormBackups />
		</Main>
	);
};

SiteSettingsBackups.propTypes = {
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
};

export default connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId )
		};
	}
)( localize( SiteSettingsBackups ) );
