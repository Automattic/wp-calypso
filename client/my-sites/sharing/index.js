/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { awaitSiteLoaded, jetpackModuleActive, navigation, sites, siteSelection } from 'my-sites/controller';
import { buttons, connections, layout } from './controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(/^\/sharing(\/buttons)?$/, siteSelection, sites, makeLayout, clientRender);
	page(
	 '/sharing/:domain',
	 siteSelection,
	 navigation,
	 awaitSiteLoaded,
	 jetpackModuleActive( 'publicize', false ),
	 connections,
	 layout,
	 makeLayout,
	 clientRender
	);
	page(
	 '/sharing/buttons/:domain',
	 siteSelection,
	 navigation,
	 awaitSiteLoaded,
	 jetpackModuleActive( 'sharedaddy' ),
	 buttons,
	 layout,
	 makeLayout,
	 clientRender
	);
}
