/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withGlobalEvents from '../higher-order/with-global-events';

/**
 * Browser dependencies
 */

const { FocusEvent } = window;

class FocusableIframe extends Component {
	constructor( props ) {
		super( ...arguments );

		this.checkFocus = this.checkFocus.bind( this );

		this.node = props.iframeRef || createRef();
	}

	/**
	 * Checks whether the iframe is the activeElement, inferring that it has
	 * then received focus, and calls the `onFocus` prop callback.
	 */
	checkFocus() {
		const iframe = this.node.current;

		if ( document.activeElement !== iframe ) {
			return;
		}

		const focusEvent = new FocusEvent( 'focus', { bubbles: true } );
		iframe.dispatchEvent( focusEvent );

		const { onFocus } = this.props;
		if ( onFocus ) {
			onFocus( focusEvent );
		}
	}

	render() {
		// Disable reason: The rendered iframe is a pass-through component,
		// assigning props inherited from the rendering parent. It's the
		// responsibility of the parent to assign a title.

		/* eslint-disable jsx-a11y/iframe-has-title */
		return (
			<iframe
				ref={ this.node }
				{ ...omit( this.props, [ 'iframeRef', 'onFocus' ] ) }
			/>
		);
		/* eslint-enable jsx-a11y/iframe-has-title */
	}
}

export default withGlobalEvents( {
	blur: 'checkFocus',
} )( FocusableIframe );
