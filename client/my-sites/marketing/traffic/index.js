import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CloudflareAnalyticsSettings from 'calypso/my-sites/site-settings/analytics/form-cloudflare-analytics';
import AnalyticsSettings from 'calypso/my-sites/site-settings/analytics/form-google-analytics';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackSiteStats from 'calypso/my-sites/site-settings/jetpack-site-stats';
import RelatedPosts from 'calypso/my-sites/site-settings/related-posts';
import SeoSettingsHelpCard from 'calypso/my-sites/site-settings/seo-settings/help';
import SeoSettingsMain from 'calypso/my-sites/site-settings/seo-settings/main';
import SiteVerification from 'calypso/my-sites/site-settings/seo-settings/site-verification';
import Shortlinks from 'calypso/my-sites/site-settings/shortlinks';
import Sitemaps from 'calypso/my-sites/site-settings/sitemaps';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const SiteSettingsTraffic = ( {
	fields,
	handleAutosavingToggle,
	handleAutosavingRadio,
	handleSubmitForm,
	isAdmin,
	isJetpack,
	isJetpackAdmin,
	isRequestingSettings,
	isSavingSettings,
	setFieldValue,
	translate,
} ) => (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<Main className="settings-traffic site-settings" wideLayout>
		<PageViewTracker path="/marketing/traffic/:site" title="Marketing > Traffic" />
		{ ! isAdmin && (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'You are not authorized to view this page' ) }
			/>
		) }
		<JetpackDevModeNotice />

		{ isAdmin && <SeoSettingsHelpCard disabled={ isRequestingSettings || isSavingSettings } /> }
		{ isAdmin && <SeoSettingsMain /> }
		{ isAdmin && (
			<RelatedPosts
				onSubmitForm={ handleSubmitForm }
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
		) }
		{ ! isJetpack && isAdmin && config.isEnabled( 'cloudflare' ) && (
			<CloudflareAnalyticsSettings />
		) }

		{ isJetpackAdmin && (
			<JetpackSiteStats
				handleAutosavingToggle={ handleAutosavingToggle }
				setFieldValue={ setFieldValue }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
		) }
		{ isAdmin && <AnalyticsSettings /> }
		{ isJetpackAdmin && (
			<Shortlinks
				handleAutosavingRadio={ handleAutosavingRadio }
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
				onSubmitForm={ handleSubmitForm }
			/>
		) }
		{ isAdmin && (
			<Sitemaps
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
		) }
		{ isAdmin && <SiteVerification /> }
	</Main>
);

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isAdmin = canCurrentUser( state, siteId, 'manage_options' );
	const isJetpack = isJetpackSite( state, siteId );
	const isJetpackAdmin = isJetpack && isAdmin;

	return {
		isAdmin,
		isJetpack,
		isJetpackAdmin,
	};
} );

const getFormSettings = ( settings ) =>
	pick( settings, [
		'stats',
		'admin_bar',
		'hide_smile',
		'count_roles',
		'roles',
		'jetpack_relatedposts_allowed',
		'jetpack_relatedposts_enabled',
		'jetpack_relatedposts_show_headline',
		'jetpack_relatedposts_show_thumbnails',
		'blog_public',
	] );

export default connectComponent(
	localize( wrapSettingsForm( getFormSettings )( SiteSettingsTraffic ) )
);
