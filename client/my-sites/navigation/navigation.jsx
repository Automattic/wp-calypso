/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	SitePicker = require( 'my-sites/picker' ),
	Sidebar = require( 'my-sites/sidebar' );

var SITE_HEIGHT = 66,
	EXTRA_SITE_ITEMS_HEIGHT = 200,
	MAX_SIDEBAR_HEIGHT = 1200;

module.exports = React.createClass( {
	displayName: 'MySitesNavigation',

	mixins: [ observe( 'sites', 'user', 'layoutFocus' ) ],

	/**
	 * Calculate the height of the sites list based on how many sites
	 * the user has to be displayed
	 *
	 * @return {number}
	 */
	getSitesHeight: function() {
		var count = this.props.user.get().visible_site_count;
		return ( count * SITE_HEIGHT ) + EXTRA_SITE_ITEMS_HEIGHT;
	},

	preventPickerDefault: function( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	render: function() {
		var layoutFocus = this.props.layoutFocus,
			containerHeight = MAX_SIDEBAR_HEIGHT;

		// When layout focus is on sites list
		// Calculate the height of the navigation block
		if ( layoutFocus.getCurrent() === 'sites' ) {
			containerHeight = this.getSitesHeight();
		}

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
