import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';

import './style.scss';

const noop = () => {};

class SplitButton extends PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		label: PropTypes.string,
		icon: PropTypes.node,
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
		href: PropTypes.string,
		whiteSeparator: PropTypes.bool,
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
		whiteSeparator: false,
	};

	state = {
		isMenuVisible: false,
	};

	popoverContext = createRef();

	handleMainClick = ( event ) => {
		event.stopPropagation();
		return this.props.onClick( event );
	};

	handleMenuClick = ( event ) => {
		event.stopPropagation();
		return this.toggleMenu( ! this.state.isMenuVisible );
	};

	hideMenu = () => this.toggleMenu( false );

	toggleMenu = ( isMenuVisible ) => {
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
			whiteSeparator,
			toggleIcon = 'chevron-down',
			popoverContext,
		} = this.props;
		const { isMenuVisible } = this.state;
		const toggleClasses = clsx( 'split-button__toggle', {
			'split-button__toggle--white-separator': whiteSeparator,
		} );
		const popoverClasses = clsx( 'split-button__menu', 'popover', popoverClassName );
		const classes = clsx( 'split-button', className, {
			'is-menu-visible': isMenuVisible,
			'is-disabled': disabled,
			'has-icon-text': label && icon,
		} );

		const isEmptyOnClick = this.props.onClick === noop;
		const onClick = isEmptyOnClick ? undefined : this.handleMainClick;

		const popoverContextRef = popoverContext ?? this.popoverContext;

		return (
			<span className={ classes }>
				{ ( icon || label ) && (
					<Button
						compact={ compact }
						primary={ primary }
						scary={ scary }
						disabled={ disabled || disableMain }
						className="split-button__main"
						onClick={ onClick }
						href={ this.props.href }
					>
						{ icon && ( typeof icon === 'string' ? <Gridicon icon={ icon } /> : icon ) }
						{ label }
					</Button>
				) }
				<Button
					compact={ compact }
					primary={ primary }
					scary={ scary }
					ref={ popoverContextRef }
					onClick={ this.handleMenuClick }
					title={ toggleTitle || translate( 'Toggle menu' ) }
					disabled={ disabled || disableMenu }
					className={ toggleClasses }
				>
					<Gridicon icon={ toggleIcon } className="split-button__toggle-icon" />
				</Button>
				<PopoverMenu
					isVisible={ isMenuVisible }
					onClose={ this.hideMenu }
					position={ position }
					context={ popoverContextRef.current }
					className={ popoverClasses }
				>
					{ children }
				</PopoverMenu>
			</span>
		);
	}
}

export default localize( SplitButton );
