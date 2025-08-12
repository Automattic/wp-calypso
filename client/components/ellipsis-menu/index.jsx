import { Button } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';

import './style.scss';

const noop = () => {};

class EllipsisMenu extends Component {
	static propTypes = {
		translate: PropTypes.func,
		toggleTitle: PropTypes.string,
		position: PropTypes.string,
		disabled: PropTypes.bool,
		onClick: PropTypes.func,
		onToggle: PropTypes.func,
		popoverClassName: PropTypes.string,
		icon: PropTypes.element,
	};

	static defaultProps = {
		onClick: noop,
		onToggle: noop,
	};

	state = {
		isMenuVisible: false,
	};

	popoverContext = createRef();

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

	hideMenu = () => this.toggleMenu( false );

	showMenu = () => this.toggleMenu( true );

	toggleMenu( isMenuVisible ) {
		if ( ! this.props.disabled ) {
			this.setState( { isMenuVisible } );
			this.props.onToggle( isMenuVisible );
		}
	}

	render() {
		const {
			toggleTitle,
			translate,
			position,
			children,
			disabled,
			icon,
			className,
			popoverClassName,
		} = this.props;
		const { isMenuVisible } = this.state;
		const classes = clsx( 'ellipsis-menu', className, {
			'is-menu-visible': isMenuVisible,
			'is-disabled': disabled,
		} );
		const popoverClasses = clsx( 'ellipsis-menu__menu', 'popover', popoverClassName );

		return (
			<span className={ classes }>
				<Button
					ref={ this.popoverContext }
					onClick={ this.handleClick }
					title={ toggleTitle || translate( 'Toggle menu' ) }
					borderless
					disabled={ disabled }
					className="ellipsis-menu__toggle"
				>
					{ icon ? icon : <Icon icon={ moreVertical } className="ellipsis-menu__toggle-icon" /> }
				</Button>
				{ isMenuVisible && (
					<PopoverMenu
						isVisible
						onClose={ this.hideMenu }
						position={ position }
						context={ this.popoverContext.current }
						className={ popoverClasses }
					>
						{ children }
					</PopoverMenu>
				) }
			</span>
		);
	}
}

export default localize( EllipsisMenu );
