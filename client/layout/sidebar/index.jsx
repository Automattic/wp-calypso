/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import SidebarRegion from './region';

export default class extends React.Component {
	static displayName = 'Sidebar';

	static propTypes = {
		className: PropTypes.string,
		hasSidebar: PropTypes.bool,
		onClick: PropTypes.func,
	};

	render() {
		const hasRegions = React.Children.toArray( this.props.children ).some(
			el => el.type === SidebarRegion
		);

		const clickHandler =
			'undefined' === typeof this.props.onClick ? {} : { onClick: this.props.onClick };
		const className = classNames(
			this.props.className,
			{
				'has-regions': hasRegions,
			},
			{
				sidebar: 'undefined' === typeof this.props.hasSidebar || this.props.hasSidebar,
			}
		);

		return (
			<ul className={ className } { ...clickHandler } data-tip-target="sidebar">
				{ this.props.children }
			</ul>
		);
	}
}
