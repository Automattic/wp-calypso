import { FEATURE_SECURITY_SETTINGS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import JetpackMonitor from 'calypso/my-sites/site-settings/form-jetpack-monitor';
import FormSecurity from 'calypso/my-sites/site-settings/form-security';
import JetpackCredentials from 'calypso/my-sites/site-settings/jetpack-credentials';
import JetpackCredentialsBanner from 'calypso/my-sites/site-settings/jetpack-credentials-banner';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import { siteHasScanProductPurchase } from 'calypso/state/purchases/selectors';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import { shouldDisplayJetpackCredentialsBanner } from 'calypso/state/site-settings/jetpack-credentials-banner/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

export const SiteSettingsSecurity = ( {
	site,
	siteId,
	hasScanProduct,
	hasActiveRewind,
	isJetpackSectionEnabled,
	shouldDisplayBanner,
	translate,
	hasActiveSecuritySettingsFeature,
} ) => {
	if ( ! hasActiveSecuritySettingsFeature ) {
		return (
			<EmptyContent
				action={ translate( 'Manage general settings for %(site)s', {
					args: { site: site.name || site.slug },
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
			<DocumentHead title={ translate( 'Security Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="settings-security__page-heading"
				headerText={ translate( 'Security Settings' ) }
				subHeaderText={ translate( "Manage your site's security settings." ) }
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
	hasScanProduct: PropTypes.bool,
	hasActiveRewind: PropTypes.bool,
	isJetpackSectionEnabled: PropTypes.bool,
	shouldDisplayBanner: PropTypes.bool,
	hasActiveSecuritySettingsFeature: PropTypes.bool,
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		site,
		siteId,
		hasScanProduct: siteHasScanProductPurchase( state, siteId ),
		hasActiveRewind: isRewindActive( state, siteId ),
		isJetpackSectionEnabled: isJetpackSectionEnabledForSite( state, siteId ),
		shouldDisplayBanner: shouldDisplayJetpackCredentialsBanner( state ),
		hasActiveSecuritySettingsFeature: hasActiveSiteFeature(
			state,
			siteId,
			FEATURE_SECURITY_SETTINGS
		),
	};
} )( localize( SiteSettingsSecurity ) );
