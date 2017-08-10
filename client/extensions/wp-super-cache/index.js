/** @format */
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
import { Tabs } from './app/constants';

export default function() {
	page( '/extensions/wp-super-cache', sites );
	page(
		`/extensions/wp-super-cache/:tab(${ values( Tabs ).join( '|' ) })?/:site`,
		siteSelection,
		navigation,
		settings
	);
}
