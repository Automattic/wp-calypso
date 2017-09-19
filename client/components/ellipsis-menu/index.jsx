/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';

class EllipsisMenu extends Component {
	static propTypes = {
		translate: PropTypes.func,
		toggleTitle: PropTypes.string,
		position: PropTypes.string,
		children: PropTypes.node,
		disabled: PropTypes.bool,
		onClick: PropTypes.func,
		onToggle: PropTypes.func,
		popoverClassName: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		onToggle: noop,
	}

	constructor() {
		super( ...arguments );

		this.state = {
			isMenuVisible: false,
			popoverContext: null
		};

		this.showMenu = this.toggleMenu.bind( this, true );
		this.hideMenu = this.toggleMenu.bind( this, false );

		this.setPopoverContext = this.setPopoverContext.bind( this );
	}

	handleClick = ( event ) => {
		const { onClick } = this.props;
		const { isMenuVisible } = this.state;

		onClick( event );

		if ( isMenuVisible ) {
			this.hideMenu();
		} else {
			this.showMenu();
		}
	};

	setPopoverContext( popoverContext ) {
		if ( popoverContext ) {
			this.setState( { popoverContext } );
		}
	}

	toggleMenu( isMenuVisible ) {
		if ( ! this.props.disabled ) {
			this.setState( { isMenuVisible } );
			this.props.onToggle( isMenuVisible );
		}
	}

	render() {
		const { toggleTitle, translate, position, children, disabled, className, popoverClassName } = this.props;
		const { isMenuVisible, popoverContext } = this.state;
		const classes = classnames( 'ellipsis-menu', className, {
			'is-menu-visible': isMenuVisible,
			'is-disabled': disabled
		} );
		const popoverClasses = classnames( 'ellipsis-menu__menu', 'popover', popoverClassName );

		return (
			<span className={ classes }>
				<Button
					ref={ this.setPopoverContext }
					onClick={ this.handleClick }
					title={ toggleTitle || translate( 'Toggle menu' ) }
					borderless
					disabled={ disabled }
					className="ellipsis-menu__toggle">
					<Gridicon
						icon="ellipsis"
						className="ellipsis-menu__toggle-icon" />
				</Button>
				<PopoverMenu
					isVisible={ isMenuVisible }
					onClose={ this.hideMenu }
					position={ position }
					context={ popoverContext }
					className={ popoverClasses }>
					{ children }
				</PopoverMenu>
			</span>
		);
	}
}

export default localize( EllipsisMenu );
