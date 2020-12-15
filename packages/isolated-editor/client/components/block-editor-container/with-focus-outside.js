/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Input types which are classified as button types, for use in considering
 * whether element is a (focus-normalized) button.
 *
 * @type {string[]}
 */
const INPUT_BUTTON_TYPES = [ 'button', 'submit' ];

/**
 * Returns true if the given element is a button element subject to focus
 * normalization, or false otherwise.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
 *
 * @param {Element} element Element to test.
 *
 * @return {boolean} Whether element is a button.
 */
function isFocusNormalizedButton( element ) {
	switch ( element.nodeName ) {
		case 'A':
		case 'BUTTON':
			return true;

		case 'INPUT':
			return includes( INPUT_BUTTON_TYPES, element.type );
	}

	return false;
}

export default createHigherOrderComponent( ( WrappedComponent ) => {
	return class extends Component {
		constructor() {
			super( ...arguments );

			this.bindNode = this.bindNode.bind( this );
			this.cancelBlurCheck = this.cancelBlurCheck.bind( this );
			this.queueBlurCheck = this.queueBlurCheck.bind( this );
			this.normalizeButtonFocus = this.normalizeButtonFocus.bind( this );
		}

		componentWillUnmount() {
			clearTimeout( this.blurCheckTimeout );
		}

		bindNode( node ) {
			if ( node ) {
				this.node = node;
			} else {
				delete this.node;
				this.cancelBlurCheck();
			}
		}

		queueBlurCheck( event ) {
			// React does not allow using an event reference asynchronously
			// due to recycling behavior, except when explicitly persisted.
			event.persist();

			// Skip blur check if clicking button. See `normalizeButtonFocus`.
			if ( this.preventBlurCheck ) {
				return;
			}

			this.blurCheckTimeout = setTimeout( () => {
				// If document is not focused then focus should remain
				// inside the wrapped component and therefore we cancel
				// this blur event thereby leaving focus in place.
				// https://developer.mozilla.org/en-US/docs/Web/API/Document/hasFocus.
				if ( ! document.hasFocus() ) {
					event.preventDefault();
					return;
				}
				if ( 'function' === typeof this.node.handleFocusOutside ) {
					this.node.handleFocusOutside( event );
				}
			}, 0 );
		}

		cancelBlurCheck() {
			clearTimeout( this.blurCheckTimeout );
			if ( typeof this.node !== 'undefined' && 'function' === typeof this.node.handleFocus ) {
				this.node.handleFocus( event );
			}
		}

		/**
		 * Handles a mousedown or mouseup event to respectively assign and
		 * unassign a flag for preventing blur check on button elements. Some
		 * browsers, namely Firefox and Safari, do not emit a focus event on
		 * button elements when clicked, while others do. The logic here
		 * intends to normalize this as treating click on buttons as focus.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
		 *
		 * @param {MouseEvent} event Event for mousedown or mouseup.
		 */
		normalizeButtonFocus( event ) {
			const { type, target } = event;

			const isInteractionEnd = includes( [ 'mouseup', 'touchend' ], type );

			if ( isInteractionEnd ) {
				this.preventBlurCheck = false;
			} else if ( isFocusNormalizedButton( target ) ) {
				this.preventBlurCheck = true;
			}
		}

		render() {
			// Disable reason: See `normalizeButtonFocus` for browser-specific
			// focus event normalization.

			/* eslint-disable jsx-a11y/no-static-element-interactions */
			return (
				<div
					onFocus={ this.cancelBlurCheck }
					onMouseDown={ this.normalizeButtonFocus }
					onMouseUp={ this.normalizeButtonFocus }
					onTouchStart={ this.normalizeButtonFocus }
					onTouchEnd={ this.normalizeButtonFocus }
					onBlur={ this.queueBlurCheck }
				>
					<WrappedComponent ref={ this.bindNode } { ...this.props } />
				</div>
			);
			/* eslint-enable jsx-a11y/no-static-element-interactions */
		}
	};
}, 'withFocusOutside' );
