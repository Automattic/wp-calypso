/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class PopoverMenuItem extends Component {
	static propTypes = {
		href: PropTypes.string,
		className: PropTypes.string,
		isSelected: PropTypes.bool,
		icon: PropTypes.string,
		focusOnHover: PropTypes.bool,
		children: PropTypes.node
	};

	static defaultProps = {
		isSelected: false,
		focusOnHover: true
	};

	focus( event ) {
		event.target.focus();
	}

	render() {
		const {
			children,
			className,
			focusOnHover,
			href,
			icon,
			isSelected,
		} = this.props;
		const classes = classnames( 'popover__menu-item', className, {
			'is-selected': isSelected
		} );
		const ItemComponent = href ? 'a' : 'button';

		let hoverHandler;
		if ( focusOnHover ) {
			hoverHandler = this.focus;
		}

		return (
			<ItemComponent
				role="menuitem"
				onMouseOver={ hoverHandler }
				tabIndex="-1"
				{ ...omit( this.props, 'icon', 'focusOnHover', 'isSelected' ) }
				className={ classes }>
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				{ children }
			</ItemComponent>
		);
	}
}
