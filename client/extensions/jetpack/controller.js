/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import WritingSettings from './writing';
import DiscussionSettings from './discussion';

const loadPage = ( path ) => {
	return () => page( path );
};

const jetpackUi = {

	// Writing Settings
	writingSettings() {
		ReactDom.render(
			React.createElement( WritingSettings, { loadPage } ),
			document.getElementById( 'primary' )
		);
	},

	// Discussion Settings
	discussionSettings() {
		ReactDom.render(
			React.createElement( DiscussionSettings, { loadPage } ),
			document.getElementById( 'primary' )
		);
	},
};

module.exports = jetpackUi;
