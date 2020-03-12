/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SitePicker from 'my-sites/picker';

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
				{ this.props.sidebar }
			</div>
		);
	}
}

export default MySitesNavigation;
