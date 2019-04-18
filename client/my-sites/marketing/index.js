/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackModuleActive, navigation, siteSelection } from 'my-sites/controller';
import { buttons, connections, layout, redirectButtons, redirectConnections } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/sharing/:domain', redirectConnections );
	page( '/sharing/buttons/:domain', redirectButtons );
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
