/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackModuleActive, navigation, sites, siteSelection } from 'my-sites/controller';
import { buttons, connections, layout, canUserManageSharing } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( /^\/sharing(\/buttons)?$/, siteSelection, sites, makeLayout, clientRender );
	page(
		'/sharing/:domain',
		siteSelection,
		navigation,
		jetpackModuleActive( 'publicize', false ),
		canUserManageSharing,
		connections,
		layout,
		makeLayout,
		clientRender
	);
	page(
		'/sharing/buttons/:domain',
		siteSelection,
		navigation,
		jetpackModuleActive( 'sharedaddy' ),
		buttons,
		layout,
		makeLayout,
		clientRender
	);
}
