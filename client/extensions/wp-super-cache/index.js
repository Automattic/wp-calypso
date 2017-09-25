/**
 * External dependencies
 */
import { compact, map } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { Tabs } from './app/constants';
import { settings } from './app/controller';
import { navigation, sites, siteSelection } from 'my-sites/controller';

export default function() {
	const validTabSlugs = compact( map( Tabs, ( { slug } ) => slug ) ).join( '|' );
	page( '/extensions/wp-super-cache', sites );
	page( `/extensions/wp-super-cache/:tab(${ validTabSlugs })?/:site`, siteSelection, navigation, settings );
}
