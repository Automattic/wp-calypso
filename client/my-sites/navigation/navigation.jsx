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

const SITE_HEIGHT = 66,
	EXTRA_SITE_ITEMS_HEIGHT = 200;

module.exports = React.createClass( {
	displayName: 'MySitesNavigation',

	mixins: [ observe( 'sites', 'user', 'layoutFocus' ) ],

	/**
	 * Calculate the height of the sites list based on how many sites
	 * the user has to be displayed
	 *
	 * @return {Number} height of the sites list
	 */
	getSitesHeight() {
		var count = this.props.user.get().visible_site_count;
		return ( count * SITE_HEIGHT ) + EXTRA_SITE_ITEMS_HEIGHT;
	},

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
			</div>
		);
	}
} );
