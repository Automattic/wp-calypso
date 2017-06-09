/**
 * External dependencies
 */
import page from 'page';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { settings } from './app/controller';
import { Tabs } from './constants';

export default function() {
	page( '/extensions/wp-job-manager', sites );
	page( `/extensions/wp-job-manager/:tab(${ values( Tabs ).map( tab => tab.slug ).join( '|' ) })?/:site`,
		siteSelection, navigation, settings );
}
