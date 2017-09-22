/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarRegion from './region';

export default React.createClass( {
	displayName: 'Sidebar',

	propTypes: {
		className: PropTypes.string,
		onClick: PropTypes.func
	},

	render: function() {
		const hasRegions = React.Children.toArray( this.props.children ).some( el => el.type === SidebarRegion );

		return (
			<ul className={ classNames( 'sidebar', this.props.className, { 'has-regions': hasRegions } ) } onClick={ this.props.onClick } data-tip-target="sidebar">
				{ this.props.children }
			</ul>
		);
	}
} );
