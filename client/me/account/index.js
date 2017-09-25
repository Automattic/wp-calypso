/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import meController from 'me/controller';

export default function() {
	page( '/me/account', meController.sidebar, controller.account );
}
