/**
 * External dependencies
 */
import React from 'react';

const EditorMention = ( { username } ) => (
	<span>@{ username }</span>
);

EditorMention.propTypes = {
	username: React.PropTypes.string.isRequired,
};

export default EditorMention;
