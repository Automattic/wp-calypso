/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import withUserMentions from 'blocks/user-mentions/index';
import withPasteToLink from 'lib/paste-to-link';
import { isEnabled } from 'config';

/* eslint-disable jsx-a11y/no-autofocus */
const PostCommentFormTextarea = React.forwardRef( ( props, ref ) => (
	<textarea
		className="comments__form-textarea"
		value={ props.value }
		placeholder={ props.placeholder }
		ref={ ref }
		onKeyUp={ props.onKeyUp }
		onKeyDown={ props.onKeyDown }
		onFocus={ props.onFocus }
		onBlur={ props.onBlur }
		onChange={ props.onChange }
		onPaste={ props.onPaste }
		autoFocus={ props.enableAutoFocus }
	/>
) );
/* eslint-enable jsx-a11y/no-autofocus */

let component = withPasteToLink( PostCommentFormTextarea );

if ( isEnabled( 'reader/user-mention-suggestions' ) ) {
	component = withUserMentions( component );
}

export default component;
