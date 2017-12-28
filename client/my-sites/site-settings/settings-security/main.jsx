/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'client/components/main';
import DocumentHead from 'client/components/data/document-head';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'client/my-sites/site-settings/navigation';
import FormSecurity from 'client/my-sites/site-settings/form-security';
import { getSelectedSite, getSelectedSiteId } from 'client/state/ui/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';
import { isRewindActive } from 'client/state/selectors';
import JetpackDevModeNotice from 'client/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackMonitor from 'client/my-sites/site-settings/form-jetpack-monitor';
import JetpackManageErrorPage from 'client/my-sites/jetpack-manage-error-page';
import Placeholder from 'client/my-sites/site-settings/placeholder';
import Backups from 'client/my-sites/site-settings/jetpack-credentials';
import QueryRewindStatus from 'client/components/data/query-rewind-status';

const SiteSettingsSecurity = ( { rewindActive, site, siteId, siteIsJetpack, translate } ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	if ( ! siteIsJetpack ) {
		return (
			<JetpackManageErrorPage
				action={ translate( 'Manage general settings for %(site)s', {
					args: { site: site.name },
				} ) }
				actionURL={ '/settings/general/' + site.slug }
				title={ translate( 'No security configuration is required.' ) }
				line={ translate( 'Security management is automatic for WordPress.com sites.' ) }
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
			/>
		);
	}

	if ( ! site.canManage ) {
		return (
			<JetpackManageErrorPage
				template="optInManage"
				title={ translate( "Looking to manage this site's security settings?" ) }
				section="security-settings"
				siteId={ siteId }
			/>
		);
	}

	if ( ! site.hasMinimumJetpackVersion ) {
		return <JetpackManageErrorPage template="updateJetpack" siteId={ siteId } version="3.4" />;
	}

	return (
		<Main className="settings-security__main site-settings">
			<QueryRewindStatus siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="security" />
			{ rewindActive && <Backups /> }
			<JetpackMonitor />
			<FormSecurity />
		</Main>
	);
};

SiteSettingsSecurity.propTypes = {
	rewindActive: PropTypes.bool,
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
};

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		rewindActive: isRewindActive( state, siteId ),
		site,
		siteId,
		siteIsJetpack: isJetpackSite( state, siteId ),
	};
} )( localize( SiteSettingsSecurity ) );
