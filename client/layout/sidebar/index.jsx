/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import SidebarRegion from './region';

export default React.createClass( {
	displayName: 'Sidebar',

	propTypes: {
		className: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	hasRegions: function() {
		React.Children.forEach( this.props.children, el => {
			if ( el && SidebarRegion === el.type ) {
				return true;
			}
		} );
		return false;
	},

	render: function() {
		return (
			<ul className={ classNames( 'sidebar', this.props.className, { 'has-regions': this.hasRegions() } ) } onClick={ this.props.onClick } data-tip-target="sidebar">
				{ this.props.children }
			</ul>
		);
	}
} );
