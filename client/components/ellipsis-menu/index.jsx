/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';

class EllipsisMenu extends Component {
	static propTypes = {
		translate: PropTypes.func,
		toggleTitle: PropTypes.string,
		position: PropTypes.string,
		children: PropTypes.node
	};

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

	setPopoverContext( popoverContext ) {
		if ( popoverContext ) {
			this.setState( { popoverContext } );
		}
	}

	toggleMenu( isMenuVisible ) {
		this.setState( { isMenuVisible } );
	}

	render() {
		const { toggleTitle, translate, position, children } = this.props;
		const { isMenuVisible, popoverContext } = this.state;
		const classes = classnames( 'ellipsis-menu', {
			'is-menu-visible': isMenuVisible
		} );

		return (
			<span className={ classes }>
				<Button
					ref={ this.setPopoverContext }
					onClick={ isMenuVisible ? this.hideMenu : this.showMenu }
					title={ toggleTitle || translate( 'Toggle menu' ) }
					borderless>
					<Gridicon
						icon="ellipsis"
						className="ellipsis-menu__toggle-icon" />
				</Button>
				<PopoverMenu
					isVisible={ isMenuVisible }
					onClose={ this.hideMenu }
					position={ position }
					context={ popoverContext }
					className="ellipsis-menu__menu popover">
					{ children }
				</PopoverMenu>
			</span>
		);
	}
}

export default localize( EllipsisMenu );
