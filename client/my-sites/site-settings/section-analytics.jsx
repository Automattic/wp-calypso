/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AnalyticsForm from 'my-sites/site-settings/form-analytics';

export default React.createClass( {
	displayName: 'SiteSettingsAnalytics',

	render() {
		return (
			<AnalyticsForm site={ this.props.site } />
		);
	}
} );
