/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';

class MySitesNavigation extends React.Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = event => {
		event.preventDefault();
		event.stopPropagation();
	};

	render() {
		return (
			<div className="sites-navigation">
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onSiteSelect={ this.props.onSiteSelect }
					onClose={ this.preventPickerDefault }
				/>
				<Sidebar path={ this.props.path } />
			</div>
		);
	}
}

export default MySitesNavigation;
