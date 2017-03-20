/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import SeoSettingsMain from 'my-sites/site-settings/seo-settings/main';
import SeoSettingsHelpCard from 'my-sites/site-settings/seo-settings/help';
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';
import RelatedPosts from 'my-sites/site-settings/related-posts';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsTraffic = ( {
	fields,
	handleAutosavingToggle,
	handleSubmitForm,
	isRequestingSettings,
	isSavingSettings,
	site,
	sites,
	upgradeToBusiness
} ) => (
	<Main className="traffic__main site-settings">
		<SidebarNavigation />
		<SiteSettingsNavigation site={ site } section="traffic" />

		<SeoSettingsHelpCard />
		<RelatedPosts
			onSubmitForm={ handleSubmitForm }
			handleAutosavingToggle={ handleAutosavingToggle }
			isSavingSettings={ isSavingSettings }
			isRequestingSettings={ isRequestingSettings }
			fields={ fields }
		/>
		<AnalyticsSettings />
		<SeoSettingsMain sites={ sites } upgradeToBusiness={ upgradeToBusiness } />
	</Main>
);

SiteSettingsTraffic.propTypes = {
	sites: PropTypes.object.isRequired,
	upgradeToBusiness: PropTypes.func.isRequired,
};

const connectComponent = connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
);

const getFormSettings = partialRight( pick, [
	'jetpack_relatedposts_allowed',
	'jetpack_relatedposts_enabled',
	'jetpack_relatedposts_show_headline',
	'jetpack_relatedposts_show_thumbnails',
] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsTraffic );
