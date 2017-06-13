/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import WritingSettings from './writing';
import DiscussionSettings from './discussion';
import { renderPage } from 'lib/react-helpers';

const loadPage = ( path ) => {
	return () => page( path );
};

const jetpackUi = {

	// Writing Settings
	writingSettings( context ) {
		renderPage( context, React.createElement( WritingSettings, { loadPage } ) );
	},

	// Discussion Settings
	discussionSettings( context ) {
		renderPage( context, React.createElement( DiscussionSettings, { loadPage } ) );
	},
};

module.exports = jetpackUi;
