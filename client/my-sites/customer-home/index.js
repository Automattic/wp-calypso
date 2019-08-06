/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import customerHome from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/customer-home', siteSelection, sites, makeLayout, clientRender );

	page(
		'/customer-home/:site_id',
		siteSelection,
		navigation,
		customerHome,
		makeLayout,
		clientRender
	);
}
