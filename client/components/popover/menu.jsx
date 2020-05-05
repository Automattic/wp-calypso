/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';

const isInvalidTarget = ( target ) => {
	return target.tagName === 'HR';
};

class PopoverMenu extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		isVisible: PropTypes.bool.isRequired,
		onClose: PropTypes.func.isRequired,
		position: PropTypes.string,
		className: PropTypes.string,
		popoverComponent: PropTypes.elementType,
		popoverTitle: PropTypes.string, // used by ReaderPopover
		customPosition: PropTypes.object,
	};

	static defaultProps = {
		autoPosition: true,
		position: 'top',
		popoverComponent: Popover,
	};

	menu = React.createRef();

	componentWillUnmount() {
		// Make sure we don't hold on to reference to the DOM reference
		this._previouslyFocusedElement = null;
	}

	render() {
		const {
			popoverComponent: PopoverComponent,
			autoPosition,
			className,
			context,
			customPosition,
			isVisible,
			popoverTitle,
			position,
		} = this.props;

		return (
			<PopoverComponent
				onClose={ this._onClose }
				onShow={ this._onShow }
				autoPosition={ autoPosition }
				className={ className }
				context={ context }
				customPosition={ customPosition }
				isVisible={ isVisible }
				popoverTitle={ popoverTitle }
				position={ position }
			>
				<div
					ref={ this.menu }
					role="menu"
					className="popover__menu"
					onKeyDown={ this._onKeyDown }
					tabIndex="-1"
				>
					{ React.Children.map( this.props.children, this._setPropsOnChild, this ) }
				</div>
			</PopoverComponent>
		);
	}

	_setPropsOnChild = ( child ) => {
		if ( child == null ) {
			return child;
		}

		const { action, onClick } = child.props;

		return React.cloneElement( child, {
			action: null,
			onClick: () => {
				onClick && onClick();
				this._onClose( action );
			},
		} );
	};

	_onShow = () => {
		const elementToFocus = this.menu.current;

		this._previouslyFocusedElement = document.activeElement;

		if ( elementToFocus ) {
			elementToFocus.focus();
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

		let first = menu.firstChild,
			last = menu.lastChild;

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
				this.props.onClose();
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
