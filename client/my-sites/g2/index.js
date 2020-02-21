/**
 * External dependencies
 *
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { show } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/g2', siteSelection, sites, makeLayout, clientRender );
	page( '/g2/:site_id', siteSelection, navigation, show, makeLayout, clientRender );
}
