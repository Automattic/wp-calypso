/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import withUserMentions from 'blocks/user-mentions/index';
import { isEnabled } from 'config';

// @todo Move ref forwarding to the HOC
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
	/>
) );

let component = PostCommentFormTextarea;
if ( isEnabled( 'reader/user-mention-suggestions' ) ) {
	component = withUserMentions( PostCommentFormTextarea );
}

export default component;
