/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UserMentionsExampleInput from './example-input';

const UserMentionsExample = ( { translate } ) => (
	<div className="docs__design-assets-group">
		<p>{ translate( 'Try typing an @username into the text input below.' ) }</p>
		<UserMentionsExampleInput />
	</div>
);

const LocalizedUserMentionsExample = localize( UserMentionsExample );
LocalizedUserMentionsExample.displayName = 'UserMentions';

export default LocalizedUserMentionsExample;
