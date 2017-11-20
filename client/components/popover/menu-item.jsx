/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { noop, omit } from 'lodash';
import Gridicon from 'gridicons';

export default class PopoverMenuItem extends Component {
	static propTypes = {
		href: PropTypes.string,
		className: PropTypes.string,
		isSelected: PropTypes.bool,
		icon: PropTypes.string,
		focusOnHover: PropTypes.bool,
		onMouseOver: PropTypes.func,
	};

	static defaultProps = {
		isSelected: false,
		focusOnHover: true,
		onMouseOver: noop,
	};

	handleMouseOver = ( event ) => {
		const { focusOnHover } = this.props;

		if ( focusOnHover ) {
			event.target.focus();
		}

		this.props.onMouseOver();
	};

	render() {
		const { children, className, href, icon, isSelected } = this.props;
		const classes = classnames( 'popover__menu-item', className, {
			'is-selected': isSelected,
		} );
		const ItemComponent = href ? 'a' : 'button';

		return (
			<ItemComponent
				role="menuitem"
				onMouseOver={ this.handleMouseOver }
				tabIndex="-1"
				{ ...omit( this.props, 'icon', 'focusOnHover', 'isSelected' ) }
				className={ classes }
			>
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				{ children }
			</ItemComponent>
		);
	}
}
