/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import EmptyContent from 'calypso/components/empty-content';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SeoSettingsMain from 'calypso/my-sites/site-settings/seo-settings/main';
import SeoSettingsHelpCard from 'calypso/my-sites/site-settings/seo-settings/help';
import SiteVerification from 'calypso/my-sites/site-settings/seo-settings/site-verification';
import AnalyticsSettings from 'calypso/my-sites/site-settings/form-analytics';
import JetpackDevModeNotice from 'calypso/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackSiteStats from 'calypso/my-sites/site-settings/jetpack-site-stats';
import JetpackAds from 'calypso/my-sites/site-settings/jetpack-ads';
import RelatedPosts from 'calypso/my-sites/site-settings/related-posts';
import Sitemaps from 'calypso/my-sites/site-settings/sitemaps';
import Shortlinks from 'calypso/my-sites/site-settings/shortlinks';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const SiteSettingsTraffic = ( {
	fields,
	handleAutosavingToggle,
	handleAutosavingRadio,
	handleSubmitForm,
	isAdmin,
	isJetpackAdmin,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
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

		{ isJetpackAdmin && (
			<JetpackAds
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
				onSubmitForm={ handleSubmitForm }
				onChangeField={ onChangeField }
			/>
		) }
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
		isJetpackAdmin,
	};
} );

const getFormSettings = partialRight( pick, [
	'stats',
	'admin_bar',
	'hide_smile',
	'count_roles',
	'roles',
	'enable_header_ad',
	'wordads_ccpa_enabled',
	'wordads_ccpa_privacy_policy_url',
	'jetpack_relatedposts_allowed',
	'jetpack_relatedposts_enabled',
	'jetpack_relatedposts_show_headline',
	'jetpack_relatedposts_show_thumbnails',
	'blog_public',
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsTraffic );
