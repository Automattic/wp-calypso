/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { resemblesUrl } from 'lib/url';

/**
 * Paste-to-link adds special paste behaviour to the wrapped component.
 *
 * If the clipboard contains a URL and some text is selected, pasting will wrap the selected text
 * in an <a> element with the href set to the URL in the clipboard.
 *
 * @example: withPasteToLink( Component )
 * @param {object} WrappedComponent - React component to wrap
 * @returns {object} Enhanced component
 */
export default WrappedComponent => {
	class WithPasteToLink extends React.Component {
		static displayName = `withPasteToLink( ${ WrappedComponent.displayName ||
			WrappedComponent.name } )`;
		static propTypes = {};

		handlePaste = event => {
			const clipboardText = event.clipboardData && event.clipboardData.getData( 'text/plain' );

			// If we have a URL in the clipboard, pass it to insertLink to wrap in an <a> element
			if ( clipboardText && clipboardText.length > 0 && resemblesUrl( clipboardText ) ) {
				event.preventDefault();
				this.insertLink( clipboardText );
			}
		};

		// Insert a link from the clipboard into the textbox
		insertLink( url ) {
			const { forwardedRef } = this.props;

			if ( ! forwardedRef ) {
				return;
			}

			const node = forwardedRef.current;

			// If selectionStart and selectionEnd are the same, we don't have a selection
			if ( node.selectionStart === node.selectionEnd ) {
				return;
			}

			const textBeforeSelection = node.value.slice( 0, node.selectionStart );
			const selectionText = node.value.slice( node.selectionStart, node.selectionEnd );
			const textAfterSelectionEnd = node.value.slice( node.selectionEnd, node.value.length + 1 );

			const newLink = '<a href="' + encodeURI( url ) + '">' + selectionText + '</a>';

			// Set the new text field value, including the link
			node.value = textBeforeSelection + newLink + textAfterSelectionEnd;

			// Move the caret to the end of the inserted string
			node.selectionEnd = textBeforeSelection.length + newLink.length;
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					onPaste={ this.handlePaste }
					ref={ this.props.forwardedRef }
				/>
			);
		}
	}

	return React.forwardRef( ( props, ref ) => {
		return <WithPasteToLink { ...props } forwardedRef={ ref } />;
	} );
};
