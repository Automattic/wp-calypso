import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import { renderTab } from './app/controller';
import Zone from './components/settings/zone';
import ZoneCreator from './components/settings/zone-creator';
import ZonesDashboard from './components/settings/zones-dashboard';
import installActionHandlers from './state/data-layer';
import reducer from './state/reducer';
import './style.scss';

export default async function ( _, addReducer ) {
	await addReducer( [ 'extensions', 'zoninator' ], reducer );
	installActionHandlers();

	page( '/extensions/zoninator', siteSelection, sites, makeLayout, clientRender );
	page( '/extensions/zoninator/new', siteSelection, sites, makeLayout, clientRender );
	page( '/extensions/zoninator/zone', siteSelection, sites, makeLayout, clientRender );

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
