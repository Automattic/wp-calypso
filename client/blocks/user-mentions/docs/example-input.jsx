import React from 'react';
import FormTextarea from 'calypso/components/forms/form-textarea';
import addUserMentions from '../add';

const UserMentionsExampleInput = React.forwardRef( ( props, ref ) => (
	<FormTextarea forwardedRef={ ref } onKeyUp={ props.onKeyUp } onKeyDown={ props.onKeyDown } />
) );

export default addUserMentions( UserMentionsExampleInput );
