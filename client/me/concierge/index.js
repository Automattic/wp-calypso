/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import meController from 'me/controller';
import controller from './controller';

export default () => {
	if ( config.isEnabled( 'concierge-chats' ) ) {
		page( '/me/concierge', meController.sidebar, controller.concierge );
	}
};
