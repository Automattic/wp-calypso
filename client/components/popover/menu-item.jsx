/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default class PopoverMenuItem extends Component {
	static propTypes = {
		href: PropTypes.string,
		className: PropTypes.string,
		selected: PropTypes.bool,
		icon: PropTypes.string,
		focusOnHover: PropTypes.bool,
		children: PropTypes.node
	};

	static defaultProps = {
		selected: false,
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
			selected,
		} = this.props;
		const classes = classnames( 'popover__menu-item', className, {
			'is-selected': selected
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
				{ ...omit( this.props, 'icon', 'focusOnHover' ) }
				className={ classes }>
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				{ children }
			</ItemComponent>
		);
	}
}
