/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SeoSettingsMain from 'my-sites/site-settings/seo-settings/main';
import AnalyticsSettings from 'my-sites/site-settings/form-analytics';

class SiteSettingsTraffic extends Component {
	render() {
		const { sites, upgradeToBusiness } = this.props;
		return (
			<div>
				<SeoSettingsMain sites={ sites } upgradeToBusiness={ upgradeToBusiness } />
				<AnalyticsSettings />
			</div>
		);
	}
}

export default SiteSettingsTraffic;
