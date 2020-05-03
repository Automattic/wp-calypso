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
import reducer from './state/reducer';

/**
 * Style dependencies
 */
import './style.scss';

export default async function ( _, addReducer ) {
	await addReducer( [ 'extensions', 'wpSuperCache' ], reducer );

	const validTabSlugs = compact( map( Tabs, ( { slug } ) => slug ) ).join( '|' );
	page( '/extensions/wp-super-cache', siteSelection, sites, makeLayout, clientRender );
	page(
		`/extensions/wp-super-cache/:tab(${ validTabSlugs })?/:site`,
		siteSelection,
		navigation,
		settings,
		makeLayout,
		clientRender
	);
}
