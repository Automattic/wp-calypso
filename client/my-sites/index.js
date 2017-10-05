/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	page( '/sites/:sitesFilter?', controller.siteSelection, controller.sites );
}
