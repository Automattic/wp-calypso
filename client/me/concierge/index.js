/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';

export default () => {
	if ( config.isEnabled( 'concierge-chats' ) ) {
		page( '/me/concierge', controller.concierge );
	}
};
