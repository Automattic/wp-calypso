/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UserMentionsExampleInput from './example-input';

const exampleSuggestions = [
	{
		ID: 1,
		user_login: 'bungle',
	},
	{
		ID: 2,
		user_login: 'george',
	},
	{
		ID: 3,
		user_login: 'zippy',
	},
	{
		ID: 4,
		user_login: 'geoffrey',
	},
];

const UserMentionsExample = ( { translate } ) => (
	<div className="docs__design-assets-group">
		<p>{ translate( 'Try typing an @username into the text input below.' ) }</p>
		<UserMentionsExampleInput suggestions={ exampleSuggestions } />
	</div>
);

const LocalizedUserMentionsExample = localize( UserMentionsExample );
LocalizedUserMentionsExample.displayName = 'UserMentions';

export default LocalizedUserMentionsExample;
