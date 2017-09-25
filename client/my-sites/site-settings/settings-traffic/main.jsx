/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AmpJetpack from 'my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'my-sites/site-settings/amp/wpcom';
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';
import JetpackAds from 'my-sites/site-settings/jetpack-ads';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import JetpackSiteStats from 'my-sites/site-settings/jetpack-site-stats';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import Placeholder from 'my-sites/site-settings/placeholder';
import RelatedPosts from 'my-sites/site-settings/related-posts';
import SeoSettingsHelpCard from 'my-sites/site-settings/seo-settings/help';
import SeoSettingsMain from 'my-sites/site-settings/seo-settings/main';
import SiteVerification from 'my-sites/site-settings/seo-settings/site-verification';
import Sitemaps from 'my-sites/site-settings/sitemaps';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

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

			{ jetpackSettingsUiSupported &&
				<JetpackSiteStats
					handleAutosavingToggle={ handleAutosavingToggle }
					setFieldValue={ setFieldValue }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			}
			{ jetpackSettingsUiSupported &&
				<JetpackAds
					handleAutosavingToggle={ handleAutosavingToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			}
			<RelatedPosts
				onSubmitForm={ handleSubmitForm }
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
			{ isJetpack
				? <AmpJetpack />
				: <AmpWpcom
					submitForm={ submitForm }
					trackEvent={ trackEvent }
					updateFields={ updateFields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			}
			<SeoSettingsHelpCard />
			<SeoSettingsMain />
			<AnalyticsSettings />
			<Sitemaps
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>
			{ site && <SiteVerification /> }
		</Main>
	);
};

const connectComponent = connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const jetpackSettingsUiSupported = isJetpack && siteSupportsJetpackSettingsUi( state, siteId );

		return {
			site,
			isJetpack,
			jetpackSettingsUiSupported,
		};
	}
);

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

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsTraffic );
