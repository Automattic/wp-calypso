/**
 * External Dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import * as controller from './controller';

export default function() {
	page(
		'/by/:username',
		controller.profile
	);
}
