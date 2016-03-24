/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';
import DesignMenu from 'my-sites/design-menu';
import config from 'config';

module.exports = React.createClass( {
	displayName: 'MySitesNavigation',

	mixins: [ observe( 'sites', 'user', 'layoutFocus' ) ],

	preventPickerDefault( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	render() {
		var layoutFocus = this.props.layoutFocus;

		return (
			<div className="sites-navigation">
				<SitePicker
					layoutFocus={ layoutFocus }
					sites={ this.props.sites }
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					user={ this.props.user }
					onClose={ this.preventPickerDefault }
				/>
				<Sidebar
					layoutFocus={ layoutFocus }
					sites={ this.props.sites }
					allSitesPath={ this.props.allSitesPath }
					path={ this.props.path }
					siteBasePath={ this.props.siteBasePath }
					user={ this.props.user }
				/>
				{ config.isEnabled( 'design-layout' ) &&
					<DesignMenu />
				}
			</div>
		);
	}
} );
