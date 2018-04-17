/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UserMentionSuggestionsExampleInput from './example-input';

const UserMentionSuggestionsExample = ( { translate } ) => (
	<div className="docs__design-assets-group">
		<p>{ translate( 'Try typing an @username into the text input below.' ) }</p>
		<UserMentionSuggestionsExampleInput />
	</div>
);

const LocalizedUserMentionSuggestionsExample = localize( UserMentionSuggestionsExample );
LocalizedUserMentionSuggestionsExample.displayName = 'UserMentionSuggestions';

export default LocalizedUserMentionSuggestionsExample;
