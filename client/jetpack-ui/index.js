/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	page( '/writing', controller.writingSettings );
	page( '/discussion', controller.discussionSettings );
}
