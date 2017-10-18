/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import { show } from './controller';

export default function() {
	page( '/tasks/:domain?', controller.siteSelection, controller.navigation, show );
}
