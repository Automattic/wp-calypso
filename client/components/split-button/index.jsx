/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';

class SplitButton extends PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		label: PropTypes.string,
		icon: PropTypes.string,
		toggleTitle: PropTypes.string,
		position: PropTypes.string,
		disabled: PropTypes.bool,
		disableMain: PropTypes.bool,
		disableMenu: PropTypes.bool,
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		scary: PropTypes.bool,
		onClick: PropTypes.func,
		onToggle: PropTypes.func,
		popoverClassName: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		onToggle: noop,
		label: '',
		icon: '',
		position: 'bottom left',
		disabled: false,
		disableMain: false,
		disableMenu: false,
		compact: false,
		primary: false,
		scary: false,
	};

	state = {
		isMenuVisible: false,
		popoverContext: false,
	};

	handleMainClick = event => this.props.onClick( event );

	handleMenuClick = () => this.toggleMenu( ! this.state.isMenuVisible );

	hideMenu = () => this.toggleMenu( false );

	setPopoverContext = popoverContext => popoverContext && this.setState( { popoverContext } );

	toggleMenu = isMenuVisible => {
		if ( ! this.props.disabled ) {
			this.setState( { isMenuVisible } );
			this.props.onToggle( isMenuVisible );
		}
	};

	render() {
		const {
			label,
			icon,
			compact,
			primary,
			scary,
			toggleTitle,
			translate,
			position,
			children,
			disabled,
			disableMain,
			disableMenu,
			className,
			popoverClassName,
		} = this.props;
		const { isMenuVisible, popoverContext } = this.state;
		const popoverClasses = classnames( 'split-button__menu', 'popover', popoverClassName );
		const classes = classnames( 'split-button', className, {
			'is-menu-visible': isMenuVisible,
			'is-disabled': disabled,
			'has-icon-text': label && icon,
		} );

		return (
			<span className={ classes }>
				<Button
					compact={ compact }
					primary={ primary }
					scary={ scary }
					onClick={ this.handleMainClick }
					disabled={ disabled || disableMain }
					className="split-button__main"
				>
					{ icon && <Gridicon icon={ icon } /> }
					{ label }
				</Button>
				<Button
					compact={ compact }
					primary={ primary }
					scary={ scary }
					ref={ this.setPopoverContext }
					onClick={ this.handleMenuClick }
					title={ toggleTitle || translate( 'Toggle menu' ) }
					disabled={ disabled || disableMenu }
					className="split-button__toggle"
				>
					<Gridicon icon="chevron-down" className="split-button__toggle-icon" />
				</Button>
				<PopoverMenu
					isVisible={ isMenuVisible }
					onClose={ this.hideMenu }
					position={ position }
					context={ popoverContext }
					className={ popoverClasses }
				>
					{ children }
				</PopoverMenu>
			</span>
		);
	}
}

export default localize( SplitButton );
