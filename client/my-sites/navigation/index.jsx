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
			<div>
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
				/>
				<Sidebar path={ this.props.path } siteBasePath={ this.props.siteBasePath } />
			</div>
		);
	}
}

export default MySitesNavigation;
