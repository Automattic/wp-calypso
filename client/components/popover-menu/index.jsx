import { Popover } from '@automattic/components';
import PropTypes from 'prop-types';
import { createRef, Children, cloneElement, Component } from 'react';

import './style.scss';

const isInvalidTarget = ( target ) => {
	return target.tagName === 'HR';
};

class PopoverMenu extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		isVisible: PropTypes.bool.isRequired,
		focusOnShow: PropTypes.bool,
		onClose: PropTypes.func.isRequired,
		position: PropTypes.string,
		className: PropTypes.string,
		popoverComponent: PropTypes.elementType,
		popoverTitle: PropTypes.string, // used by ReaderPopover
		customPosition: PropTypes.object,
		relativePosition: PropTypes.object,
	};

	static defaultProps = {
		autoPosition: true,
		focusOnShow: true,
		position: 'top',
		popoverComponent: Popover,
	};

	menu = createRef();

	delayedFocus = null;

	componentWillUnmount() {
		// Make sure we don't hold on to reference to the DOM reference
		this._previouslyFocusedElement = null;

		if ( this.delayedFocus !== null ) {
			window.clearTimeout( this.delayedFocus );
		}
	}

	render() {
		const {
			popoverComponent: PopoverComponent,
			autoPosition,
			className,
			context,
			customPosition,
			relativePosition,
			isVisible,
			popoverTitle,
			position,
			id,
		} = this.props;

		return (
			<PopoverComponent
				onClose={ this._onClose }
				onShow={ this._onShow }
				autoPosition={ autoPosition }
				className={ className }
				context={ context }
				customPosition={ customPosition }
				relativePosition={ relativePosition }
				isVisible={ isVisible }
				// Make sure we focus on PopoverMenu so that we can control PopoverMenuItem by keyboard
				focusOnShow={ false }
				popoverTitle={ popoverTitle }
				position={ position }
			>
				<div
					ref={ this.menu }
					id={ id }
					role="menu"
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					className="popover__menu"
					onKeyDown={ this._onKeyDown }
					tabIndex="-1"
				>
					{ Children.map( this.props.children, this._setPropsOnChild, this ) }
				</div>
			</PopoverComponent>
		);
	}

	_setPropsOnChild = ( child ) => {
		if ( child == null ) {
			return child;
		}

		const { action, onClick } = child.props;

		return cloneElement( child, {
			action: null,
			onClick: ( event ) => {
				onClick && onClick( event );
				this._onClose( action );
			},
		} );
	};

	_onShow = () => {
		if ( ! this.props.focusOnShow ) {
			return;
		}

		// When a menu opens, or when a menubar receives focus, keyboard focus is placed on the first item
		// See: https://www.w3.org/TR/wai-aria-practices/#keyboard-interaction-12
		const elementToFocus = this.menu.current.firstChild;

		this._previouslyFocusedElement = document.activeElement;

		if ( elementToFocus ) {
			// Defer the focus a bit to make sure that the popover already has the final position.
			// Initially, after first render, the popover is positioned outside the screen, at
			// { top: -9999, left: -9999 } where it already has dimensions. These dimensions are measured
			// and used to calculate the final position.
			// Focusing the element while it's off the screen would cause unwanted scrolling.
			this.delayedFocus = setTimeout( () => {
				elementToFocus.focus();
			}, 1 );
		}
	};

	/*
	 * Warning:
	 *
	 * This doesn't cover crazy things like a separator at the very top or
	 * bottom.
	 */
	_getClosestSibling = ( target, isDownwardMotion = true ) => {
		const menu = this.menu.current;

		let first = menu.firstChild;
		let last = menu.lastChild;

		if ( ! isDownwardMotion ) {
			first = menu.lastChild;
			last = menu.firstChild;
		}

		if ( target === menu ) {
			return first;
		}

		const closest = target[ isDownwardMotion ? 'nextSibling' : 'previousSibling' ];

		const sibling = closest || last;

		return isInvalidTarget( sibling )
			? this._getClosestSibling( sibling, isDownwardMotion )
			: sibling;
	};

	_onKeyDown = ( event ) => {
		const target = event.target;
		let handled = false;
		let elementToFocus;

		switch ( event.keyCode ) {
			case 9: // tab
				this._onClose();
				handled = true;
				break;
			case 38: // up arrow
				elementToFocus = this._getClosestSibling( target, false );
				handled = true;
				break;
			case 40: // down arrow
				elementToFocus = this._getClosestSibling( target, true );
				handled = true;
				break;
			default:
				break; // do nothing
		}

		if ( elementToFocus ) {
			elementToFocus.focus();
		}

		if ( handled ) {
			event.preventDefault();
		}
	};

	_onClose = ( action ) => {
		if ( this._previouslyFocusedElement ) {
			this._previouslyFocusedElement.focus();
			this._previouslyFocusedElement = null;
		}

		if ( this.props.onClose ) {
			this.props.onClose( action );
		}
	};
}

export default PopoverMenu;
