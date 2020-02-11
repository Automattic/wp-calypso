/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { jetpackScan } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/scan', siteSelection, sites, makeLayout, clientRender );

	page( '/scan/:site', siteSelection, navigation, jetpackScan, makeLayout, clientRender );
}
