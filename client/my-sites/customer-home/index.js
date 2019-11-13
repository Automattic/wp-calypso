/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import home, { maybeRedirect, redirectToPrimarySiteOrReader } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/', redirectToPrimarySiteOrReader, siteSelection, sites, makeLayout, clientRender );
	page( '/home', siteSelection, sites, makeLayout, clientRender );

	page( '/home/:siteId', siteSelection, maybeRedirect, navigation, home, makeLayout, clientRender );
}
