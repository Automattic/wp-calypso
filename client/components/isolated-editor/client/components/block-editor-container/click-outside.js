/**
 * WordPress dependencies
 */

import { compose } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';
import { Component } from '@wordpress/element';
import withFocusOutside from './with-focus-outside.js';

const ClickOutsideWrapper = withFocusOutside(
	class extends Component {
		handleFocus( ev ) {
			this.props.onFocus();
		}

		handleFocusOutside( ev ) {
			const { relatedTarget } = ev;
			const { clearSelectedBlock } = this.props;

			if ( relatedTarget ) {
				if (
					relatedTarget.classList.contains( 'media-modal' ) ||
					relatedTarget.classList.contains( 'iso-editor' )
				) {
					return;
				}
			}

			if ( ! relatedTarget || relatedTarget.closest( '.iso-editor' ) === null ) {
				this.props.onOutside();
				clearSelectedBlock();
			}
		}

		render() {
			return this.props.children;
		}
	}
);

export default compose( [
	withDispatch( ( dispatch ) => {
		const { clearSelectedBlock } = dispatch( 'core/block-editor' );

		return {
			clearSelectedBlock,
		};
	} ),
] )( ClickOutsideWrapper );
