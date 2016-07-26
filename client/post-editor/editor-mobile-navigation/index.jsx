/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const Site = require( 'blocks/site' ),
	Gridicon = require( 'components/gridicon' ),
	layoutFocus = require( 'lib/layout-focus' );

const EditorMobileNavigation = React.createClass( {

	toggleSidebar: function() {
		layoutFocus.set( 'sidebar' );
	},

	render: function() {
		if ( ! this.props.site ) {
			return null;
		}

		return (
			<div className="editor-mobile-navigation">
				<Site indicator={ false } site={ this.props.site } />
				<button className="button editor-mobile-navigation__toggle" onClick={ this.toggleSidebar }>
					{ this.translate( 'Actions' ) }
				</button>
				<Gridicon
					icon="cross"
					onClick={ this.props.onClose }
					className="editor-mobile-navigation__close" />
			</div>
		);
	}
} );

module.exports = EditorMobileNavigation;
