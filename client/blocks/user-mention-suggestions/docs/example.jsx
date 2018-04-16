/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import UserMentionSuggestionsExampleInput from './example-input';

class UserMentionSuggestionsExample extends Component {
	render() {
		return (
			<div className="docs__design-assets-group">
				<UserMentionSuggestionsExampleInput />
			</div>
		);
	}
}

export default UserMentionSuggestionsExample;
