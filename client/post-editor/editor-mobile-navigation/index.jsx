/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const EditorMobileNavigation = React.createClass( {

	openSidebar: function() {
		this.props.setLayoutFocus( 'sidebar' );
	},

	closeSidebar: function() {
		this.props.setLayoutFocus( 'content' );
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

module.exports = connect( null, { setLayoutFocus } )( EditorMobileNavigation );
