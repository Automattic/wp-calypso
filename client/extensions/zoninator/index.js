/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { renderTab } from './app/controller';
import Zone from './components/settings/zone';
import ZoneCreator from './components/settings/zone-creator';
import ZonesDashboard from './components/settings/zones-dashboard';
import installActionHandlers from './state/data-layer';
import { navigation, sites, siteSelection } from 'my-sites/controller';

export default function() {
	page( '/extensions/zoninator', sites );
	page( '/extensions/zoninator/new', sites );
	page( '/extensions/zoninator/zone', sites );

	page( '/extensions/zoninator/:site', siteSelection, navigation, renderTab( ZonesDashboard ) );
	page( '/extensions/zoninator/new/:site', siteSelection, navigation, renderTab( ZoneCreator ) );
	page( '/extensions/zoninator/zone/:site/:zone', siteSelection, navigation, renderTab( Zone ) );
}

installActionHandlers();
