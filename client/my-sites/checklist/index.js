/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { show } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/checklist', siteSelection, sites, makeLayout, clientRender );
	page( '/checklist/:site_id', siteSelection, navigation, show, makeLayout, clientRender );
}
