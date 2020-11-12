/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextarea from 'calypso/components/forms/form-textarea';
import IsolatedBlockEditor from 'calypso/components/isolated-editor/client';
import withUserMentions from 'calypso/blocks/user-mentions/index';
import withPasteToLink from 'calypso/lib/paste-to-link';
import { isEnabled } from 'calypso/config';

/* eslint-disable jsx-a11y/no-autofocus */
const PostCommentFormTextarea = React.forwardRef( ( props, ref ) => (
	<IsolatedBlockEditor
		className="comments__form-textarea"
		value={ props.value }
		placeholder={ props.placeholder }
		forwardedRef={ ref }
		onKeyUp={ props.onKeyUp }
		onKeyDown={ props.onKeyDown }
		onFocus={ props.onFocus }
		onBlur={ props.onBlur }
		onChange={ props.onChange }
		onPaste={ props.onPaste }
		autoFocus={ props.enableAutoFocus }
		onSaveBlocks={ console.log }
		onSaveContent={ console.log }
	/>
) );
/* eslint-enable jsx-a11y/no-autofocus */

let component = withPasteToLink( PostCommentFormTextarea );

if ( isEnabled( 'reader/user-mention-suggestions' ) ) {
	component = withUserMentions( component );
}

export default component;
