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
	redirectConnections,
} from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( /^\/sharing(\/buttons)?$/, siteSelection, sites, makeLayout, clientRender );
	page( /^\/marketing?$/, siteSelection, sites, makeLayout, clientRender );
	page(
		/^\/marketing(\/sharing-buttons)(\/connections)?$/,
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	page( '/sharing/:domain', redirectConnections );
	page( '/sharing/buttons/:domain', redirectSharingButtons );
	page( '/marketing/:domain', redirectConnections );

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
