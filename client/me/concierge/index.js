/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';

export default () => {
	page( '/me/concierge', meController.sidebar, controller.concierge );
};
