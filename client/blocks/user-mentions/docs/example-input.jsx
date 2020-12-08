/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import addUserMentions from '../add';
import FormTextarea from 'calypso/components/forms/form-textarea';

const UserMentionsExampleInput = React.forwardRef( ( props, ref ) => (
	<FormTextarea forwardedRef={ ref } onKeyUp={ props.onKeyUp } onKeyDown={ props.onKeyDown } />
) );

export default addUserMentions( UserMentionsExampleInput );
