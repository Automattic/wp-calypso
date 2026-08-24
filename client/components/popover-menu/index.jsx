import { Popover } from '@automattic/components';
import PropTypes from 'prop-types';
import { createRef, Children, cloneElement, Component } from 'react';

import './style.scss';

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

		this._previouslyFocusedElement = document.activeElement;

		// Defer the focus a bit to make sure that the popover already has the final position.
		// Initially, after first render, the popover is positioned outside the screen, at
		// { top: -9999, left: -9999 } where it already has dimensions. These dimensions are measured
		// and used to calculate the final position.
		// Focusing the element while it's off the screen would cause unwanted scrolling.
		this.delayedFocus = setTimeout( () => {
			// When a menu opens, keyboard focus is placed on the first item.
			// See: https://www.w3.org/TR/wai-aria-practices/#keyboard-interaction-12
			const [ elementToFocus ] = this._getNavigableItems();
			if ( elementToFocus ) {
				elementToFocus.focus();
			}
		}, 1 );
	};

	// The navigable items are every menu item in DOM order, regardless of how
	// deeply they are nested. Querying by role (rather than walking direct
	// siblings) means items grouped inside a wrapper element stay reachable and
	// non-item content — separators, headings, wrappers — is skipped.
	_getNavigableItems = () => {
		const menu = this.menu.current;
		if ( ! menu ) {
			return [];
		}

		return Array.from( menu.querySelectorAll( '[role="menuitem"]' ) ).filter(
			( item ) => ! item.disabled && item.getAttribute( 'aria-disabled' ) !== 'true'
		);
	};

	_focusSibling = ( target, isDownwardMotion ) => {
		const items = this._getNavigableItems();
		if ( ! items.length ) {
			return;
		}

		const currentIndex = items.indexOf( target );
		let nextIndex;

		if ( currentIndex === -1 ) {
			// Focus is on the menu container itself: start at the appropriate end.
			nextIndex = isDownwardMotion ? 0 : items.length - 1;
		} else {
			// Clamp at the ends, matching the previous behavior.
			nextIndex = Math.min(
				items.length - 1,
				Math.max( 0, currentIndex + ( isDownwardMotion ? 1 : -1 ) )
			);
		}

		items[ nextIndex ].focus();
	};

	_onKeyDown = ( event ) => {
		const target = event.target;
		let handled = false;

		switch ( event.keyCode ) {
			case 9: // tab
				this._onClose();
				handled = true;
				break;
			case 38: // up arrow
				this._focusSibling( target, false );
				handled = true;
				break;
			case 40: // down arrow
				this._focusSibling( target, true );
				handled = true;
				break;
			default:
				break; // do nothing
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
