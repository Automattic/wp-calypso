/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import Gridicon from 'components/gridicon';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const EditorMobileNavigation = React.createClass( {

	toggleSidebar: function() {
		this.props.setLayoutFocus( 'sidebar' );
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

module.exports = connect( null, { setLayoutFocus } )( EditorMobileNavigation );
