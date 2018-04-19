/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExampleInput from './example-input';
import withUserMentionSuggestions from '../with-user-mention-suggestions';

const UserMentionSuggestionsExampleInput = ( { onKeyPress } ) => (
	<textarea onKeyPress={ onKeyPress } />
);

export default withUserMentionSuggestions( UserMentionSuggestionsExampleInput );
