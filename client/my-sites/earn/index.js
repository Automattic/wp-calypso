/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import earnController from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/earn', siteSelection, sites, makeLayout, clientRender );
	page( '/earn/:site_id', earnController.redirect, makeLayout, clientRender );
	page(
		'/earn/:section/:site_id',
		siteSelection,
		navigation,
		earnController.layout,
		makeLayout,
		clientRender
	);
}
