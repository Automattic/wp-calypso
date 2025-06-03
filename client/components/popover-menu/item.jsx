import { Gridicon, ExternalLink } from '@automattic/components';
import { Icon } from '@wordpress/components';
import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';

const noop = () => {};

export default class PopoverMenuItem extends Component {
	static propTypes = {
		href: PropTypes.string,
		disabled: PropTypes.bool,
		className: PropTypes.string,
		isSelected: PropTypes.bool,
		icon: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string, PropTypes.element ] ),
		useWordPressIcon: PropTypes.bool,
		iconSize: PropTypes.number,
		focusOnHover: PropTypes.bool,
		onClick: PropTypes.func,
		onMouseOver: PropTypes.func,
		isExternalLink: PropTypes.bool,
		itemComponent: PropTypes.elementType,
	};

	static defaultProps = {
		isSelected: false,
		focusOnHover: true,
		onMouseOver: noop,
		itemComponent: 'button',
		useWordPressIcon: false,
		iconSize: 18,
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
			disabled,
			href,
			icon,
			useWordPressIcon,
			iconSize,
			isExternalLink,
			isSelected,
		} = this.props;
		const itemProps = omit(
			this.props,
			'icon',
			'useWordPressIcon',
			'iconSize',
			'focusOnHover',
			'isSelected',
			'isExternalLink',
			'className',
			'itemComponent'
		);
		const classes = clsx( 'popover__menu-item', className, {
			'is-selected': isSelected,
		} );

		let ItemComponent = this.props.itemComponent;
		if ( isExternalLink && href && ! disabled ) {
			ItemComponent = ExternalLink;
			itemProps.icon = true;
		} else if ( href && ! disabled ) {
			ItemComponent = 'a';
		}

		let itemIcon = icon;
		if ( typeof icon === 'string' ) {
			if ( useWordPressIcon ) {
				itemIcon = <Icon icon={ icon } size={ iconSize } />;
			} else {
				itemIcon = <Gridicon icon={ icon } size={ iconSize } />;
			}
		}

		return (
			<ItemComponent
				role="menuitem"
				tabIndex="-1"
				className={ classes }
				{ ...itemProps }
				onMouseOver={ this.handleMouseOver }
			>
				{ itemIcon }
				{ children }
			</ItemComponent>
		);
	}
}
