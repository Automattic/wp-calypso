import { FEATURE_SECURITY_SETTINGS, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import FormSecurity from 'calypso/my-sites/site-settings/form-security';
import JetpackCredentials from 'calypso/my-sites/site-settings/jetpack-credentials';
import JetpackCredentialsBanner from 'calypso/my-sites/site-settings/jetpack-credentials-banner';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import SiteSettingsNavigation from 'calypso/my-sites/site-settings/navigation';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import isRewindActive from 'calypso/state/selectors/is-rewind-active';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { shouldDisplayJetpackCredentialsBanner } from 'calypso/state/site-settings/jetpack-credentials-banner/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

export const SiteSettingsSecurity = ( {
	site,
	siteId,
	hasScan,
	hasSecuritySettings,
	hasActiveRewind,
	isJetpackSectionEnabled,
	shouldDisplayBanner,
	translate,
} ) => {
	if ( ! hasSecuritySettings ) {
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
	const showCredentials = ! isJetpackSectionEnabled && ( hasActiveRewind || hasScan );
	const showJetpackBanner =
		isJetpackSectionEnabled && ( hasActiveRewind || hasScan ) && shouldDisplayBanner;

	return (
		<Main className="settings-security site-settings">
			<QueryRewindState siteId={ siteId } />
			<QuerySiteFeatures siteIds={ [ siteId ] } />
			<DocumentHead title={ translate( 'Security Settings' ) } />
			<JetpackDevModeNotice />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Security Settings' ) }
				subtitle={ translate( "Manage your site's security settings." ) }
			/>
			<SiteSettingsNavigation site={ site } section="security" />
			{ showCredentials && <JetpackCredentials /> }
			{ showJetpackBanner && <JetpackCredentialsBanner siteSlug={ site.slug } /> }
			<FormSecurity />
		</Main>
	);
};

SiteSettingsSecurity.propTypes = {
	site: PropTypes.object,
	siteId: PropTypes.number,
	hasScan: PropTypes.bool,
	hasActiveRewind: PropTypes.bool,
	isJetpackSectionEnabled: PropTypes.bool,
	shouldDisplayBanner: PropTypes.bool,
	hasSecuritySettings: PropTypes.bool,
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );

	return {
		site,
		siteId,
		hasScan: siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ),
		hasActiveRewind: isRewindActive( state, siteId ),
		isJetpackSectionEnabled: isJetpackSectionEnabledForSite( state, siteId ),
		shouldDisplayBanner: shouldDisplayJetpackCredentialsBanner( state ),
		hasSecuritySettings: siteHasFeature( state, siteId, FEATURE_SECURITY_SETTINGS ),
	};
} )( localize( SiteSettingsSecurity ) );
