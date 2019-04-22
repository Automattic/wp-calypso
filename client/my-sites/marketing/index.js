/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackModuleActive, navigation, siteSelection, sites } from 'my-sites/controller';
import {
	buttons,
	connections,
	layout,
	redirectSharingButtons,
	redirectSeo,
	seo,
} from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	[
		'/marketing',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/seo',
		'/sharing',
		'/sharing/buttons',
	].forEach( path => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/sharing/:domain', redirectSeo );
	page( '/sharing/buttons/:domain', redirectSharingButtons );
	page( '/marketing/:domain', redirectSeo );

	page(
		'/marketing/connections/:domain',
		siteSelection,
		navigation,
		jetpackModuleActive( 'publicize', false ),
		connections,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/marketing/seo/:domain',
		siteSelection,
		navigation,
		seo,
		layout,
		makeLayout,
		clientRender
	);
	page(
		'/marketing/sharing-buttons/:domain',
		siteSelection,
		navigation,
		jetpackModuleActive( 'sharedaddy' ),
		buttons,
		layout,
		makeLayout,
		clientRender
	);
}
