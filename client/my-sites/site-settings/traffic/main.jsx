/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SeoSettingsMain from 'my-sites/site-settings/seo-settings/main';
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';

class SiteSettingsTraffic extends Component {
	static propTypes = {
		sites: PropTypes.object.isRequired,
		upgradeToBusiness: PropTypes.func.isRequired,
	};

	render() {
		const { sites, upgradeToBusiness } = this.props;
		return (
			<Main className="site-settings">
				<SeoSettingsMain sites={ sites } upgradeToBusiness={ upgradeToBusiness } />
				<AnalyticsSettings />
			</Main>
		);
	}
}

export default SiteSettingsTraffic;
