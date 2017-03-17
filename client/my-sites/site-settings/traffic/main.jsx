/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import SeoSettingsMain from 'my-sites/site-settings/seo-settings/main';
import SeoSettingsHelpCard from 'my-sites/site-settings/seo-settings/help';
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsTraffic = ( {
	site,
	sites,
	upgradeToBusiness
} ) => (
	<Main className="traffic__main site-settings">
		<SidebarNavigation />
		<SiteSettingsNavigation site={ site } section="traffic" />

		<SeoSettingsHelpCard />
		<AnalyticsSettings />
		<SeoSettingsMain sites={ sites } upgradeToBusiness={ upgradeToBusiness } />
	</Main>
);

SiteSettingsTraffic.propTypes = {
	sites: PropTypes.object.isRequired,
	upgradeToBusiness: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( SiteSettingsTraffic );
