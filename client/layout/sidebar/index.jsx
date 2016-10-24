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

	render: function() {
		let hasRegions = this.props.children.some( el => el.type === SidebarRegion );

		return (
			<ul className={ classNames( 'sidebar', this.props.className, { 'has-regions': hasRegions } ) } onClick={ this.props.onClick } data-tip-target="sidebar">
				{ this.props.children }
			</ul>
		);
	}
} );
