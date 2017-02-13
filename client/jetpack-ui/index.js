/**
 * External dependencies
 */
import page from 'page';
import config from 'config';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	if ( config.isEnabled( 'devdocs' ) ) {
		page( '/jetpack-ui/writing', controller.writingSettings );
		page( '/jetpack-ui/discussion', controller.discussionSettings );
	}
}
