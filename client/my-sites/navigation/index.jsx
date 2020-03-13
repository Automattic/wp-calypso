/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';
import JetpackCloudSidebar from 'landing/jetpack-cloud/components/sidebar';

class MySitesNavigation extends React.Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = event => {
		event.preventDefault();
		event.stopPropagation();
	};

	render() {
		const SidebarComponent = config.isEnabled( 'jetpack-cloud' ) ? JetpackCloudSidebar : Sidebar;

		return (
			<div>
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
				/>
				<SidebarComponent path={ this.props.path } siteBasePath={ this.props.siteBasePath } />
			</div>
		);
	}
}

export default MySitesNavigation;
