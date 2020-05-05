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
 * @example withPasteToLink( Component )
 * @param {object} WrappedComponent - React component to wrap
 * @returns {object} Enhanced component
 */
export default ( WrappedComponent ) => {
	class WithPasteToLink extends React.Component {
		static displayName = `withPasteToLink( ${
			WrappedComponent.displayName || WrappedComponent.name
		} )`;
		static propTypes = {};

		constructor( props ) {
			super( props );

			this.textareaRef = this.props.forwardedRef;
			if ( ! this.textareaRef ) {
				this.textareaRef = React.createRef();
			}
		}

		handlePaste = ( event ) => {
			const clipboardText = event.clipboardData && event.clipboardData.getData( 'text/plain' );
			const node = this.textareaRef.current;

			// If we have a URL in the clipboard and a current selection, pass the URL to insertLink
			// to wrap in an <a> element
			if (
				clipboardText &&
				clipboardText.length > 0 &&
				node &&
				node.selectionStart !== node.selectionEnd &&
				resemblesUrl( clipboardText )
			) {
				event.preventDefault();
				this.insertLink( clipboardText );
			}
		};

		// Insert a link from the clipboard into the textbox
		insertLink( url ) {
			const node = this.textareaRef.current;

			if ( ! node ) {
				return;
			}

			const textBeforeSelection = node.value.slice( 0, node.selectionStart );
			const selectionText = node.value.slice( node.selectionStart, node.selectionEnd );
			const textAfterSelectionEnd = node.value.slice( node.selectionEnd, node.value.length + 1 );

			const newLink = '<a href="' + encodeURI( url ) + '">' + selectionText + '</a>';
			const textLengthBefore = node.value.length;

			// Replace the selected text. Uses execCommand to preserve undo history
			document.execCommand( 'insertText', false, newLink );

			// If the text length hasn't changed, try directly adjusting the value for Firefox's benefit
			// see https://bugzilla.mozilla.org/show_bug.cgi?id=1220696
			if ( textLengthBefore === node.value.length ) {
				// Set the new text field value, including the link
				node.value = textBeforeSelection + newLink + textAfterSelectionEnd;

				// Move the caret to the end of the inserted string
				node.selectionEnd = textBeforeSelection.length + newLink.length;
			}
		}

		render() {
			return (
				<WrappedComponent { ...this.props } onPaste={ this.handlePaste } ref={ this.textareaRef } />
			);
		}
	}

	return React.forwardRef( ( props, ref ) => {
		return <WithPasteToLink { ...props } forwardedRef={ ref } />;
	} );
};
