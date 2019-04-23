/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { jetpackModuleActive, navigation, siteSelection, sites } from 'my-sites/controller';
import {
	buttons,
	connections,
	layout,
	marketingTools,
	redirectSharingButtons,
	redirectTraffic,
	traffic,
} from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	const paths = [
		'/marketing',
		'/marketing/connections',
		'/marketing/sharing-buttons',
		'/marketing/traffic',
		'/marketing/tools',
		'/sharing',
		'/sharing/buttons',
	];

	if ( config.isEnabled( 'marketing/tools' ) ) {
		paths.push( '/marketing/tools' );
	}

	paths.forEach( path => page( path, ...[ siteSelection, sites, makeLayout, clientRender ] ) );

	page( '/sharing/:domain', redirectTraffic );
	page( '/sharing/buttons/:domain', redirectSharingButtons );
	page( '/marketing/:domain', redirectTraffic );

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
		'/marketing/traffic/:domain',
		siteSelection,
		navigation,
		traffic,
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

	if ( config.isEnabled( 'marketing/tools' ) ) {
		page(
			'/marketing/tools/:domain',
			siteSelection,
			navigation,
			marketingTools,
			layout,
			makeLayout,
			clientRender
		);
	}

	page( '/marketing/:domain', context => {
		if ( config.isEnabled( 'marketing/tools' ) ) {
			page.redirect( `/marketing/tools/${ context.params.domain }` );
		} else {
			redirectConnections();
		}
	} );
}
