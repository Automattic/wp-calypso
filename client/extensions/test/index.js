/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import controller from './controller';


export default function() {
	page( '/extensions/test/writing', controller.writingSettings );
	page( '/extensions/test/discussion', controller.discussionSettings );
	page( '/extensions/test/', controller.writingSettings );
}
