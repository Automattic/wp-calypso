/**
 * External dependencies
 *
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { show, maybeRedirect } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/checklist', siteSelection, sites, makeLayout, clientRender );
	page(
		'/checklist/:site_id',
		siteSelection,
		maybeRedirect,
		navigation,
		show,
		makeLayout,
		clientRender
	);
}
