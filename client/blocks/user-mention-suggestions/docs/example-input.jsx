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

const UserMentionSuggestionsExampleInput = ( { onKeyPress } ) => (
	<textarea onKeyPress={ onKeyPress } />
);

export default withUserMentionSuggestions( UserMentionSuggestionsExampleInput );
