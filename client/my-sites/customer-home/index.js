/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import home, { maybeRedirect } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	page( '/home', siteSelection, sites, makeLayout, clientRender );

	page( '/home/:siteId', siteSelection, maybeRedirect, navigation, home, makeLayout, clientRender );
}
