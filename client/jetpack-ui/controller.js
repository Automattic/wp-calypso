/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import WritingSettings from './writing';
import DiscussionSettings from './discussion';

const jetpackUi = {

	// Writing Settings
	writingSettings() {
		ReactDom.render(
			React.createElement( WritingSettings, {} ),
			document.getElementById( 'primary' )
		);
	},

	// Discussion Settings
	discussionSettings() {
		ReactDom.render(
			React.createElement( DiscussionSettings, {} ),
			document.getElementById( 'primary' )
		);
	},
};

module.exports = jetpackUi;
