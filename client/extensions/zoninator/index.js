/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { renderTab } from './app/controller';
import ZoneCreator from './components/settings/zone-creator';
import Zone from './components/settings/zone';
import ZonesDashboard from './components/settings/zones-dashboard';
import installActionHandlers from './state/data-layer';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/extensions/zoninator', sites, makeLayout, clientRender );
	page( '/extensions/zoninator/new', sites, makeLayout, clientRender );
	page( '/extensions/zoninator/zone', sites, makeLayout, clientRender );

	page(
		'/extensions/zoninator/:site',
		siteSelection,
		navigation,
		renderTab( ZonesDashboard ),
		makeLayout,
		clientRender
	);
	page(
		'/extensions/zoninator/new/:site',
		siteSelection,
		navigation,
		renderTab( ZoneCreator ),
		makeLayout,
		clientRender
	);
	page(
		'/extensions/zoninator/zone/:site/:zone',
		siteSelection,
		navigation,
		renderTab( Zone ),
		makeLayout,
		clientRender
	);
}

installActionHandlers();
