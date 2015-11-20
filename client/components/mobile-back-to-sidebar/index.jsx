/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var layoutFocus = require( 'lib/layout-focus' );

var MobileBackToSidebar = React.createClass( {

	toggleSidebar: function( event ) {
		event.preventDefault();
		layoutFocus.set( 'sidebar' );
	},

	render: function() {

		return (
			<div className="mobile-back-to-sidebar" onTouchTap={ this.toggleSidebar }>
				<svg className="gridicon gridicon-back-arrow mobile-back-to-sidebar__icon" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M8.886 4L7 5.886 13.114 12 7 18.114 8.886 20l8-8"/></g></svg>
				<span className="mobile-back-to-sidebar__content">
					{ this.props.children }
				</span>
			</div>
		);
	}
} );

module.exports = MobileBackToSidebar;
