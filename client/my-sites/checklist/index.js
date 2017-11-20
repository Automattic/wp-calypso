/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { show } from './controller';

export default function() {
	page( '/checklist/:domain?', siteSelection, navigation, show );
}
