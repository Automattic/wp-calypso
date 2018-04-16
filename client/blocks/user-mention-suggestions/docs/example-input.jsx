/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExampleInput from './example-input';
import withUserMentionSuggestions from '../with-user-mention-suggestions';

class UserMentionSuggestionsExampleInput extends Component {
	render() {
		return <textarea onKeyPress={ this.props.onKeyPress } />;
	}
}

export default withUserMentionSuggestions( UserMentionSuggestionsExampleInput );
