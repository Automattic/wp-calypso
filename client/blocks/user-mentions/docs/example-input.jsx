import { forwardRef } from 'react';
import FormTextarea from 'calypso/components/forms/form-textarea';
import addUserMentions from '../add';

const UserMentionsExampleInput = forwardRef( ( props, ref ) => (
	<FormTextarea forwardedRef={ ref } onKeyUp={ props.onKeyUp } onKeyDown={ props.onKeyDown } />
) );

export default addUserMentions( UserMentionsExampleInput );
