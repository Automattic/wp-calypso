import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import { connect } from 'react-redux';
import blazeDropDownIllustration from 'calypso/assets/images/illustrations/blaze-drop-down.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import AsyncLoad from 'calypso/components/async-load';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CloudflareAnalyticsSettings from 'calypso/my-sites/site-settings/analytics/form-cloudflare-analytics';
import AnalyticsSettings from 'calypso/my-sites/site-settings/analytics/form-google-analytics';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackSiteStats from 'calypso/my-sites/site-settings/jetpack-site-stats';
import RelatedPosts from 'calypso/my-sites/site-settings/related-posts';
import SeoSettingsHelpCard from 'calypso/my-sites/site-settings/seo-settings/help';
import SiteVerification from 'calypso/my-sites/site-settings/seo-settings/site-verification';
import Shortlinks from 'calypso/my-sites/site-settings/shortlinks';
import Sitemaps from 'calypso/my-sites/site-settings/sitemaps';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import isBlazeEnabled from 'calypso/state/ui/selectors/is-blaze-enabled';

import './style.scss';

const SiteSettingsTraffic = ( {
	fields,
	handleAutosavingRadio,
	handleAutosavingToggle,
	handleSubmitForm,
	isAdmin,
	isJetpack,
	isJetpackAdmin,
	isRequestingSettings,
	isSavingSettings,
	setFieldValue,
	siteId,
	siteSlug,
	shouldShowAdvertisingOption,
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
		{ isAdmin && shouldShowAdvertisingOption && (
			<PromoCardBlock
				productSlug="blaze"
				impressionEvent="calypso_marketing_traffic_blaze_banner_view"
				clickEvent="calypso_marketing_traffic_blaze_banner_click"
				headerText={ translate( 'Reach new readers and customers' ) }
				contentText={ translate(
					'Use WordPress Blaze to increase your reach by promoting your work to the larger WordPress.com community of blogs and sites. '
				) }
				ctaText={ translate( 'Get started' ) }
				image={ blazeDropDownIllustration }
				href={ `/advertising/${ siteSlug || '' }` }
			/>
		) }
		{ isAdmin && <SeoSettingsHelpCard disabled={ isRequestingSettings || isSavingSettings } /> }
		{ isAdmin && (
			<AsyncLoad
				key={ siteId }
				require="calypso/my-sites/site-settings/seo-settings/form"
				placeholder={ null }
			/>
		) }
		{ isAdmin && (
			<RelatedPosts
				onSubmitForm={ handleSubmitForm }
				handleToggle={ handleAutosavingToggle }
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
	const site = getSelectedSite( state );
	const isAdmin = canCurrentUser( state, siteId, 'manage_options' );
	const isJetpack = isJetpackSite( state, siteId );
	const isJetpackAdmin = isJetpack && isAdmin;
	const shouldShowAdvertisingOption = isBlazeEnabled( state );

	return {
		siteId,
		siteSlug: site?.slug,
		isAdmin,
		isJetpack,
		isJetpackAdmin,
		shouldShowAdvertisingOption,
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
