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

export default function() {
	page( '/extensions/zoninator', sites );
	page( '/extensions/zoninator/:site', siteSelection, navigation, renderTab( ZonesDashboard ) );
	page( '/extensions/zoninator/new/:site', siteSelection, navigation, renderTab( ZoneCreator ) );
	page( '/extensions/zoninator/:site/:zone', siteSelection, navigation, renderTab( Zone ) );
}

installActionHandlers();
