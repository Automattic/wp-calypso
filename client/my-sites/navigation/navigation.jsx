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
import CartData from 'components/data/cart';

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
					onClose={ this.preventPickerDefault }
				/>
				<CartData>
					<Sidebar path={ this.props.path } siteBasePath={ this.props.siteBasePath } />
				</CartData>
			</div>
		);
	}
}

export default MySitesNavigation;
