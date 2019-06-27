/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import SidebarRegion from './region';

export default class extends React.Component {
	static displayName = 'Sidebar';

	static propTypes = {
		className: PropTypes.string,
		onClick: PropTypes.func,
	};

	render() {
		const hasRegions = React.Children.toArray( this.props.children ).some(
			el => el.type === SidebarRegion
		);

		const clickHandler =
			'undefined' === typeof this.props.onClick ? {} : { onClick: this.props.onClick };

		const className = classNames( 'sidebar', this.props.className, { 'has-regions': hasRegions } );

		return (
			<div className={ className } { ...clickHandler } data-tip-target="sidebar">
				{ this.props.children }
			</div>
		);
	}
}
