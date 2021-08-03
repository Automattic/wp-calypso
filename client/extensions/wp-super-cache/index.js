import { compact, map } from 'lodash';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import { Tabs } from './app/constants';
import { settings } from './app/controller';
import reducer from './state/reducer';
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
