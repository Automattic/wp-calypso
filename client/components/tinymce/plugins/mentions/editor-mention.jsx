/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

const EditorMention = ( { username } ) => <span>@{ username }</span>;

EditorMention.propTypes = {
	username: PropTypes.string.isRequired,
};

export default EditorMention;
