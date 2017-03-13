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
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsTraffic = ( {
	site,
	sites,
	upgradeToBusiness
} ) => {
	return (
		<Main className="site-settings">
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="traffic" />

			<SeoSettingsMain sites={ sites } upgradeToBusiness={ upgradeToBusiness } />
			<AnalyticsSettings />
		</Main>
	);
};

SiteSettingsTraffic.propTypes = {
	sites: PropTypes.object.isRequired,
	upgradeToBusiness: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( SiteSettingsTraffic );
