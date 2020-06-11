/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import getRewindState from 'state/selectors/get-rewind-state';
import JetpackCredentials from 'my-sites/site-settings/jetpack-credentials';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import Main from 'components/main';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySitePurchases from 'components/data/query-site-purchases';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import { getSitePurchases } from 'state/purchases/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const SiteSettingsJetpack = ( {
	rewindState,
	sitePurchases,
	site,
	siteId,
	siteIsJetpack,
	translate,
} ) => {
	//todo: this check makes sense in Jetpack section?
	if ( ! siteIsJetpack ) {
		return (
			<JetpackManageErrorPage
				action={ translate( 'Manage general settings for %(site)s', {
					args: { site: site.name },
				} ) }
				actionURL={ '/settings/general/' + site.slug }
				title={ translate( 'No Jetpack configuration is required.' ) }
				// line={ translate( 'Security management is automatic for WordPress.com sites.' ) }
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
			/>
		);
	}

	const isRewindActive = [ 'awaitingCredentials', 'provisioning', 'active' ].includes(
		rewindState.state
	);
	const hasScanProduct = sitePurchases.some( ( p ) => p.productSlug.includes( 'jetpack_scan' ) );

	const showCredentials = isRewindActive || hasScanProduct;

	return (
		<Main className="settings-jetpack site-settings">
			<QueryRewindState siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				className="settings-jetpack__page-heading"
				headerText={ translate( 'Settings' ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="jetpack" />

			{ showCredentials && <JetpackCredentials /> }
		</Main>
	);
};

SiteSettingsJetpack.propTypes = {
	rewindState: PropTypes.bool,
	sitePurchases: PropTypes.array,
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
};

export default connect( ( state ) => {
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
} )( localize( SiteSettingsJetpack ) );
