/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const Gridicon = require( 'components/gridicon' ),
	layoutFocus = require( 'lib/layout-focus' );

const EditorMobileNavigation = React.createClass( {

	openSidebar: function() {
		layoutFocus.set( 'sidebar' );
	},

	closeSidebar: function() {
		layoutFocus.set( 'content' );
	},

	render: function() {
		if ( ! this.props.site ) {
			return null;
		}

		return (
			<div className="editor-mobile-navigation">
				<Gridicon
					icon="chevron-left"
					onClick={ this.props.onClose }
					className="editor-mobile-navigation__close" />
				<Gridicon
					icon="pencil"
					onClick={ this.closeSidebar }
					className="editor-mobile-navigation__close" />
				<Gridicon
					icon="cog"
					onClick={ this.openSidebar }
					className="editor-mobile-navigation__close" />
			</div>
		);
	}
} );

module.exports = EditorMobileNavigation;
