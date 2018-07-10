/**
 * External Dependencies
 */
import { omit, noop, includes } from 'lodash';

/**
 * WordPress Dependencies
 */
import { Component } from '@wordpress/element';
import { focus } from '@wordpress/dom';
import { UP, DOWN, LEFT, RIGHT, TAB } from '@wordpress/keycodes';

function cycleValue( value, total, offset ) {
	const nextValue = value + offset;
	if ( nextValue < 0 ) {
		return total + nextValue;
	} else if ( nextValue >= total ) {
		return nextValue - total;
	}

	return nextValue;
}

class NavigableContainer extends Component {
	constructor() {
		super( ...arguments );
		this.bindContainer = this.bindContainer.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );

		this.getFocusableContext = this.getFocusableContext.bind( this );
		this.getFocusableIndex = this.getFocusableIndex.bind( this );
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	getFocusableContext( target ) {
		const { onlyBrowserTabstops } = this.props;
		const finder = onlyBrowserTabstops ? focus.tabbable : focus.focusable;
		const focusables = finder.find( this.container );

		const index = this.getFocusableIndex( focusables, target );
		if ( index > -1 && target ) {
			return { index, target, focusables };
		}
		return null;
	}

	getFocusableIndex( focusables, target ) {
		const directIndex = focusables.indexOf( target );
		if ( directIndex !== -1 ) {
			return directIndex;
		}
	}

	onKeyDown( event ) {
		if ( this.props.onKeyDown ) {
			this.props.onKeyDown( event );
		}

		const { getFocusableContext } = this;
		const { cycle = true, eventToOffset, onNavigate = noop, stopNavigationEvents } = this.props;

		const offset = eventToOffset( event );

		// eventToOffset returns undefined if the event is not handled by the component
		if ( offset !== undefined && stopNavigationEvents ) {
			// Prevents arrow key handlers bound to the document directly interfering
			event.nativeEvent.stopImmediatePropagation();

			// When navigating a collection of items, prevent scroll containers
			// from scrolling.
			if ( event.target.getAttribute( 'role' ) === 'menuitem' ) {
				event.preventDefault();
			}

			event.stopPropagation();
		}

		if ( ! offset ) {
			return;
		}

		const context = getFocusableContext( document.activeElement );
		if ( ! context ) {
			return;
		}

		const { index, focusables } = context;
		const nextIndex = cycle ? cycleValue( index, focusables.length, offset ) : index + offset;
		if ( nextIndex >= 0 && nextIndex < focusables.length ) {
			focusables[ nextIndex ].focus();
			onNavigate( nextIndex, focusables[ nextIndex ] );
		}
	}

	render() {
		const { children, ...props } = this.props;

		// Disable reason: Assumed role is applied by parent via props spread.
		/* eslint-disable jsx-a11y/no-static-element-interactions */
		return (
			<div ref={ this.bindContainer }
				{ ...omit( props, [
					'stopNavigationEvents',
					'eventToOffset',
					'onNavigate',
					'cycle',
					'onlyBrowserTabstops',
				] ) }
				onKeyDown={ this.onKeyDown }
				onFocus={ this.onFocus }>
				{ children }
			</div>
		);
	}
}

export class NavigableMenu extends Component {
	render() {
		const { role = 'menu', orientation = 'vertical', ...rest } = this.props;

		const eventToOffset = ( evt ) => {
			const { keyCode } = evt;

			let next = [ DOWN ];
			let previous = [ UP ];

			if ( orientation === 'horizontal' ) {
				next = [ RIGHT ];
				previous = [ LEFT ];
			}

			if ( orientation === 'both' ) {
				next = [ RIGHT, DOWN ];
				previous = [ LEFT, UP ];
			}

			if ( includes( next, keyCode ) ) {
				return 1;
			} else if ( includes( previous, keyCode ) ) {
				return -1;
			}
		};

		return (
			<NavigableContainer
				stopNavigationEvents
				onlyBrowserTabstops={ false }
				role={ role }
				aria-orientation={ orientation }
				eventToOffset={ eventToOffset }
				{ ...rest }
			/>
		);
	}
}

export class TabbableContainer extends Component {
	render() {
		const eventToOffset = ( evt ) => {
			const { keyCode, shiftKey } = evt;
			if ( TAB === keyCode ) {
				return shiftKey ? -1 : 1;
			}

			// Allow custom handling of keys besides Tab.
			//
			// By default, TabbableContainer will move focus forward on Tab and
			// backward on Shift+Tab. The handler below will be used for all other
			// events. The semantics for `this.props.eventToOffset`'s return
			// values are the following:
			//
			// - +1: move focus forward
			// - -1: move focus backward
			// -  0: don't move focus, but acknowledge event and thus stop it
			// - undefined: do nothing, let the event propagate
			if ( this.props.eventToOffset ) {
				return this.props.eventToOffset( evt );
			}
		};

		return (
			<NavigableContainer
				stopNavigationEvents
				onlyBrowserTabstops
				eventToOffset={ eventToOffset }
				{ ...this.props }
			/>
		);
	}
}
