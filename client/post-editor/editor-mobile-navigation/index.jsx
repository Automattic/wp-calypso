/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const EditorMobileNavigation = React.createClass( {

	getInitialState: function() {
		return {
			sidebarOpen: false
		};
	},

	openSidebar: function() {
		if ( ! this.state.sidebarOpen ) {
			this.props.setLayoutFocus( 'sidebar' );
			this.setState( { sidebarOpen: true } );
		}
	},

	closeSidebar: function() {
		if ( this.state.sidebarOpen ) {
			this.props.setLayoutFocus( 'content' );
			this.setState( { sidebarOpen: false } );
		}
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
					className="editor-mobile-navigation__icon" />
				<Gridicon
					icon="pencil"
					onClick={ this.closeSidebar }
					className={ classnames( 'editor-mobile-navigation__icon', {
						'is-selected': ! this.state.sidebarOpen
					} ) } />
				<Gridicon
					icon="cog"
					onClick={ this.openSidebar }
					className={ classnames( 'editor-mobile-navigation__icon', {
						'is-selected': this.state.sidebarOpen
					} ) } />
			</div>
		);
	}
} );

module.exports = connect( null, { setLayoutFocus } )( EditorMobileNavigation );
