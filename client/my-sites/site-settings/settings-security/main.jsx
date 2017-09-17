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
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import FormSecurity from 'my-sites/site-settings/form-security';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackMonitor from 'my-sites/site-settings/form-jetpack-monitor';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import Placeholder from 'my-sites/site-settings/placeholder';

const SiteSettingsSecurity = ( { site, siteId, siteIsJetpack, translate } ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	if ( ! siteIsJetpack ) {
		return (
			<JetpackManageErrorPage
				action={ translate( 'Manage general settings for %(site)s', { args: { site: site.name } } ) }
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
				title= { translate( 'Looking to manage this site\'s security settings?' ) }
				section="security-settings"
				siteId={ siteId }
			/>
		);
	}

	if ( ! site.hasMinimumJetpackVersion ) {
		return (
			<JetpackManageErrorPage
				template="updateJetpack"
				siteId={ siteId }
				version="3.4"
			/>
		);
	}

	return (
		<Main className="settings-security__main site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="security" />
			<JetpackMonitor />
			<FormSecurity />
		</Main>
	);
};

SiteSettingsSecurity.propTypes = {
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
)( localize( SiteSettingsSecurity ) );
