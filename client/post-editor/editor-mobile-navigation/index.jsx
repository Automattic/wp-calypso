/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import layoutFocus from 'lib/layout-focus';

export default React.createClass( {
	displayName: 'EditorMobileNavigation',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			sidebarOpen: false
		};
	},

	openSidebar: function() {
		if ( ! this.state.sidebarOpen ) {
			layoutFocus.set( 'sidebar' );
			this.setState( { sidebarOpen: true } );
		}
	},

	closeSidebar: function() {
		if ( this.state.sidebarOpen ) {
			layoutFocus.set( 'content' );
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
