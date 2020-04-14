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
import QuerySitePurchases from 'components/data/query-site-purchases';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import { getSitePurchases } from 'state/purchases/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const SiteSettingsSecurity = ( {
	rewindState,
	sitePurchases,
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

	const credentials = find( rewindState.credentials, { role: 'main' } );
	const isManaged = credentials && credentials.type && 'managed' === credentials.type;

	const isRewindActive = [ 'awaitingCredentials', 'provisioning', 'active' ].includes(
		rewindState.state
	);
	const hasScanProduct = sitePurchases.some( p => p.productSlug.includes( 'jetpack_scan' ) );

	const showCredentials = ! isManaged && ( isRewindActive || hasScanProduct );

	return (
		<Main className="settings-security site-settings">
			<QueryRewindState siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				className="settings-security__page-heading"
				headerText={ translate( 'Settings' ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="security" />
			{ showCredentials && <JetpackCredentials /> }
			<JetpackMonitor />
			<FormSecurity />
		</Main>
	);
};

SiteSettingsSecurity.propTypes = {
	rewindState: PropTypes.bool,
	sitePurchases: PropTypes.array,
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
};

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const rewindState = getRewindState( state, siteId );
	const sitePurchases = getSitePurchases( state, siteId );

	return {
		rewindState,
		sitePurchases,
		site,
		siteId,
		siteIsJetpack: isJetpackSite( state, siteId ),
	};
} )( localize( SiteSettingsSecurity ) );
