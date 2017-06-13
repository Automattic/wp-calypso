/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	page( '/test/writing', controller.writingSettings );
	page( '/test/discussion', controller.discussionSettings );
	page( '/test/', controller.writingSettings );
}
