/** @format */

/**
 * External dependencies
 */

import page from 'page';
import { compact, map } from 'lodash';

/**
 * Internal dependencies
 */
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { settings } from './app/controller';
import { Tabs } from './app/constants';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	const validTabSlugs = compact( map( Tabs, ( { slug } ) => slug ) ).join( '|' );
	page( '/extensions/wp-super-cache', sites, makeLayout, clientRender );
	page(
		`/extensions/wp-super-cache/:tab(${ validTabSlugs })?/:site`,
		siteSelection,
		navigation,
		settings,
		makeLayout,
		clientRender
	);
}
