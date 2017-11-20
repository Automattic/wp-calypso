/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { noop, omit } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

export default class PopoverMenuItem extends Component {
	static propTypes = {
		href: PropTypes.string,
		className: PropTypes.string,
		isSelected: PropTypes.bool,
		icon: PropTypes.string,
		focusOnHover: PropTypes.bool,
		onMouseOver: PropTypes.func,
		isExternalLink: PropTypes.bool,
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
		const {
			children,
			className,
			focusOnHover,
			href,
			icon,
			isSelected,
			isExternalLink,
		} = this.props;
		const classes = classnames( 'popover__menu-item', className, {
			'is-selected': isSelected,
		} );

		let ItemComponent = href ? 'a' : 'button';
		if ( isExternalLink && href ) {
			ItemComponent = ExternalLink;
		}

		return (
			<ItemComponent
				role="menuitem"
				onMouseOver={ this.handleMouseOver }
				tabIndex="-1"
				{ ...omit( this.props, 'icon', 'focusOnHover', 'isSelected' ) }
				className={ classes }
				icon={ isExternalLink }
			>
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				{ children }
			</ItemComponent>
		);
	}
}
