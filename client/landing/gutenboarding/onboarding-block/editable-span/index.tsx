/**
 * External dependencies
 */
import * as React from 'react';

/**
 * This is a paste event handler that strips the formatting then inserts the text
 *
 * @param event the paste event
 */
function stripFormatting( event: React.ClipboardEvent< HTMLSpanElement > ) {
	event.preventDefault();
	const text = event.clipboardData.getData( 'text/plain' );

	// this puts the text in the right position (considers the caret position)
	document.execCommand( 'insertHTML', false, text );
}

interface Props extends React.PropsWithoutRef< JSX.IntrinsicElements[ 'span' ] > {
	allowFormattedPaste?: boolean;
}

export default React.forwardRef< HTMLSpanElement, Props >( function EditableSpan( props, ref ) {
	const { allowFormattedPaste } = props;

	if ( allowFormattedPaste ) {
		return <span ref={ ref } contentEditable { ...props } />;
	}
	return <span ref={ ref } onPaste={ stripFormatting } contentEditable { ...props } />;
} );
