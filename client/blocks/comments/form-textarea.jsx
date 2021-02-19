/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextarea from 'calypso/components/forms/form-textarea';
import withUserMentions from 'calypso/blocks/user-mentions/index';
import withPasteToLink from 'calypso/lib/paste-to-link';

/* eslint-disable jsx-a11y/no-autofocus */
const PostCommentFormTextarea = React.forwardRef( ( props, ref ) => (
	<FormTextarea
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
	/>
) );
/* eslint-enable jsx-a11y/no-autofocus */

export default withUserMentions( withPasteToLink( PostCommentFormTextarea ) );
