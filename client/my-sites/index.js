/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites } from './controller';

export default function() {
	page( '/sites/:sitesFilter?', siteSelection, sites );
}
