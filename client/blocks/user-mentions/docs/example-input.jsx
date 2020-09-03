/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import addUserMentions from '../add';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const UserMentionsExampleInput = React.forwardRef( ( props, ref ) => (
	<textarea
		className="form-textarea"
		ref={ ref }
		onKeyUp={ props.onKeyUp }
		onKeyDown={ props.onKeyDown }
	/>
) );
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default addUserMentions( UserMentionsExampleInput );
