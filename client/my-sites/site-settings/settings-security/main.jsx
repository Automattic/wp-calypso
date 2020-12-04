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
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import DocumentHead from 'calypso/components/data/document-head';
import FormSecurity from 'calypso/my-sites/site-settings/form-security';
import JetpackCredentials from 'calypso/my-sites/site-settings/jetpack-credentials';
import JetpackCredentialsBanner from 'calypso/my-sites/site-settings/jetpack-credentials-banner';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackManageErrorPage from 'calypso/my-sites/jetpack-manage-error-page';
import JetpackMonitor from 'calypso/my-sites/site-settings/form-jetpack-monitor';
import Main from 'calypso/components/main';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { shouldDisplayJetpackCredentialsBanner } from 'calypso/state/site-settings/jetpack-credentials-banner/selectors';
import { siteHasScanProductPurchase } from 'calypso/state/purchases/selectors';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const SiteSettingsSecurity = ( {
	site,
	siteId,
	siteIsJetpack,
	hasScanProduct,
	hasActiveRewind,
	isJetpackSectionEnabled,
	shouldDisplayBanner,
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

	// If Jetpack section is enabled, we no longer display the credentials here, instead we
	// display a Banner with a CTA that points to their new location (Settings > Jetpack).
	const showCredentials = ! isJetpackSectionEnabled && ( hasActiveRewind || hasScanProduct );
	const showJetpackBanner =
		isJetpackSectionEnabled && ( hasActiveRewind || hasScanProduct ) && shouldDisplayBanner;

	return (
		<Main className="settings-security site-settings">
			<QueryRewindState siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="settings-security__page-heading"
				headerText={ translate( 'Settings' ) }
				align="left"
			/>
			<SiteSettingsNavigation site={ site } section="security" />
			{ showCredentials && <JetpackCredentials /> }
			{ showJetpackBanner && <JetpackCredentialsBanner siteSlug={ site.slug } /> }
			<JetpackMonitor />
			<FormSecurity />
		</Main>
	);
};

SiteSettingsSecurity.propTypes = {
	site: PropTypes.object,
	siteId: PropTypes.number,
	siteIsJetpack: PropTypes.bool,
	hasScanProduct: PropTypes.bool,
	hasActiveRewind: PropTypes.bool,
	isJetpackSectionEnabled: PropTypes.bool,
	shouldDisplayBanner: PropTypes.bool,
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		site,
		siteId,
		siteIsJetpack: isJetpackSite( state, siteId ),
		hasScanProduct: siteHasScanProductPurchase( state, siteId ),
		hasActiveRewind: isRewindActive( state, siteId ),
		isJetpackSectionEnabled: isJetpackSectionEnabledForSite( state, siteId ),
		shouldDisplayBanner: shouldDisplayJetpackCredentialsBanner( state ),
	};
} )( localize( SiteSettingsSecurity ) );
