/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import home from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/home', siteSelection, sites, makeLayout, clientRender );

	page( '/home/:siteId', siteSelection, navigation, home, makeLayout, clientRender );
}
