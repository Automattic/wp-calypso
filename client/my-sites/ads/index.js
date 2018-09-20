/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import adsController from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/ads', siteSelection, sites, makeLayout, clientRender );
	page( '/ads/:site_id', adsController.redirect, makeLayout, clientRender );
	page(
		'/ads/:section/:site_id',
		siteSelection,
		navigation,
		adsController.layout,
		makeLayout,
		clientRender
	);
}
