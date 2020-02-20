/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormSecurity from 'my-sites/site-settings/form-security';
import getRewindState from 'state/selectors/get-rewind-state';
import JetpackCredentials from 'my-sites/site-settings/jetpack-credentials';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import JetpackMonitor from 'my-sites/site-settings/form-jetpack-monitor';
import Main from 'components/main';
import QueryRewindState from 'components/data/query-rewind-state';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const SiteSettingsSecurity = ( {
	showRewindCredentials,
	site,
	siteId,
	siteIsJetpack,
	translate,
} ) => {
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

	return (
		<Main className="settings-security site-settings">
			<QueryRewindState siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				className="settings-security__page-heading"
				headerText={ translate( 'Settings' ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="security" />
			{ showRewindCredentials && <JetpackCredentials /> }
			<JetpackMonitor />
			<FormSecurity />
		</Main>
	);
};

SiteSettingsSecurity.propTypes = {
	showRewindCredentials: PropTypes.bool,
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
};

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const rewind = getRewindState( state, siteId );
	const credentials = find( rewind.credentials, { role: 'main' } );
	const isManaged = credentials && credentials.type && 'managed' === credentials.type;

	return {
		showRewindCredentials:
			rewind.state === 'awaitingCredentials' ||
			rewind.state === 'provisioning' ||
			( rewind.state === 'active' && ! isManaged ),
		site,
		siteId,
		siteIsJetpack: isJetpackSite( state, siteId ),
	};
} )( localize( SiteSettingsSecurity ) );
