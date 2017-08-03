/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';

const MySitesNavigation = React.createClass( {
	displayName: 'MySitesNavigation',

	preventPickerDefault( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	render() {
		return (
			<div className="sites-navigation">
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
				/>
				<Sidebar
					allSitesPath={ this.props.allSitesPath }
					path={ this.props.path }
					siteBasePath={ this.props.siteBasePath }
				/>
			</div>
		);
	}
} );

module.exports = MySitesNavigation;
