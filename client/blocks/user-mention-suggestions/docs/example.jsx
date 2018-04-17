/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UserMentionSuggestionsExampleInput from './example-input';

class UserMentionSuggestionsExample extends Component {
	render() {
		return (
			<div className="docs__design-assets-group">
				<p>{ this.props.translate( 'Try typing an @username into the text input below.' ) }</p>
				<UserMentionSuggestionsExampleInput />
			</div>
		);
	}
}

const LocalizedUserMentionSuggestionsExample = localize( UserMentionSuggestionsExample );
LocalizedUserMentionSuggestionsExample.displayName = 'UserMentionSuggestions';

export default LocalizedUserMentionSuggestionsExample;
