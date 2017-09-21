/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';

export default function() {
	page( '/me/app-preferences', meController.sidebar, controller.preferences );
}
