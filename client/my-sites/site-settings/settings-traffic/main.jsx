/** @format */

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
import Main from 'client/components/main';
import DocumentHead from 'client/components/data/document-head';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'client/my-sites/site-settings/navigation';
import SeoSettingsMain from 'client/my-sites/site-settings/seo-settings/main';
import SeoSettingsHelpCard from 'client/my-sites/site-settings/seo-settings/help';
import SiteVerification from 'client/my-sites/site-settings/seo-settings/site-verification';
import AnalyticsSettings from 'client/my-sites/site-settings/form-analytics';
import JetpackDevModeNotice from 'client/my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackSiteStats from 'client/my-sites/site-settings/jetpack-site-stats';
import JetpackAds from 'client/my-sites/site-settings/jetpack-ads';
import RelatedPosts from 'client/my-sites/site-settings/related-posts';
import AmpJetpack from 'client/my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'client/my-sites/site-settings/amp/wpcom';
import Sitemaps from 'client/my-sites/site-settings/sitemaps';
import Search from 'client/my-sites/site-settings/search';
import Placeholder from 'client/my-sites/site-settings/placeholder';
import wrapSettingsForm from 'client/my-sites/site-settings/wrap-settings-form';
import { getSelectedSite, getSelectedSiteId } from 'client/state/ui/selectors';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'client/state/sites/selectors';

const SiteSettingsTraffic = ( {
	fields,
	jetpackSettingsUiSupported,
	handleAutosavingToggle,
	handleSubmitForm,
	isJetpack,
	isRequestingSettings,
	isSavingSettings,
	setFieldValue,
	site,
	submitForm,
	trackEvent,
	translate,
	updateFields,
} ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	return (
		<Main className="settings-traffic site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="traffic" />

			{ jetpackSettingsUiSupported && (
				<JetpackSiteStats
					handleAutosavingToggle={ handleAutosavingToggle }
					setFieldValue={ setFieldValue }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			) }
			{ jetpackSettingsUiSupported && (
				<JetpackAds
					handleAutosavingToggle={ handleAutosavingToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			) }
			<RelatedPosts
				onSubmitForm={ handleSubmitForm }
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
			{ isJetpack ? (
				<AmpJetpack />
			) : (
				<AmpWpcom
					submitForm={ submitForm }
					trackEvent={ trackEvent }
					updateFields={ updateFields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			) }
			<SeoSettingsHelpCard />
			<SeoSettingsMain />
			<AnalyticsSettings />
			<Sitemaps
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
			<Search
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
			{ site && <SiteVerification /> }
		</Main>
	);
};

const connectComponent = connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	const jetpackSettingsUiSupported = isJetpack && siteSupportsJetpackSettingsUi( state, siteId );

	return {
		site,
		isJetpack,
		jetpackSettingsUiSupported,
	};
} );

const getFormSettings = partialRight( pick, [
	'stats',
	'admin_bar',
	'hide_smile',
	'count_roles',
	'roles',
	'enable_header_ad',
	'jetpack_relatedposts_allowed',
	'jetpack_relatedposts_enabled',
	'jetpack_relatedposts_show_headline',
	'jetpack_relatedposts_show_thumbnails',
	'amp_is_supported',
	'amp_is_enabled',
	'blog_public',
] );

export default flowRight( connectComponent, localize, wrapSettingsForm( getFormSettings ) )(
	SiteSettingsTraffic
);
