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
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import SeoSettingsMain from 'my-sites/site-settings/seo-settings/main';
import SeoSettingsHelpCard from 'my-sites/site-settings/seo-settings/help';
import SiteVerification from 'my-sites/site-settings/seo-settings/site-verification';
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackSiteStats from 'my-sites/site-settings/jetpack-site-stats';
import JetpackAds from 'my-sites/site-settings/jetpack-ads';
import RelatedPosts from 'my-sites/site-settings/related-posts';
import Sitemaps from 'my-sites/site-settings/sitemaps';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const SiteSettingsTraffic = ( {
	fields,
	handleAutosavingToggle,
	handleSubmitForm,
	isJetpack,
	isRequestingSettings,
	isSavingSettings,
	setFieldValue,
	translate,
} ) => (
	<Main className="settings-traffic site-settings">
		<DocumentHead title={ translate( 'Site Settings' ) } />
		<JetpackDevModeNotice />
		<SidebarNavigation />
		<SiteSettingsNavigation section="traffic" />

		{ isJetpack && (
			<JetpackAds
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
		) }
		<SeoSettingsHelpCard disabled={ isRequestingSettings || isSavingSettings } />
		<SeoSettingsMain />
		<RelatedPosts
			onSubmitForm={ handleSubmitForm }
			handleAutosavingToggle={ handleAutosavingToggle }
			isSavingSettings={ isSavingSettings }
			isRequestingSettings={ isRequestingSettings }
			fields={ fields }
		/>
		{ isJetpack && (
			<JetpackSiteStats
				handleAutosavingToggle={ handleAutosavingToggle }
				setFieldValue={ setFieldValue }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
		) }
		<AnalyticsSettings />
		<Sitemaps
			isSavingSettings={ isSavingSettings }
			isRequestingSettings={ isRequestingSettings }
			fields={ fields }
		/>
		<SiteVerification />
	</Main>
);

const connectComponent = connect( state => ( {
	isJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
} ) );

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
	'blog_public',
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsTraffic );
