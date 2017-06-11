/**
 * External Dependencies
 */
import React, { Children, Component } from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import SidebarRegion from './region';

export default class Sidebar extends Component {
	render() {
		const hasRegions = Children.toArray( this.props.children ).some( el => el.type === SidebarRegion );
		const classes = classNames( 'sidebar', this.props.className, {
			'has-regions': hasRegions
		} );

		return (
			<ul className={ classes } onClick={ this.props.onClick } data-tip-target="sidebar">
				{ this.props.children }
			</ul>
		);
	}
}

Sidebar.propTypes = {
	className: React.PropTypes.string,
	onClick: React.PropTypes.func
};
