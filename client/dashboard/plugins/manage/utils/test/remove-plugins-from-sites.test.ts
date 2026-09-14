import { removePluginsFromSites } from '../remove-plugins-from-sites';
import type { PluginListRow } from '../../types';
import type { PluginItem, PluginsResponse } from '@automattic/api-core';

const makePlugin = ( id: string ): PluginItem => ( { id, slug: id, name: id } ) as PluginItem;

const makeRow = ( id: string, siteIds: number[] ): PluginListRow =>
	( { id, siteIds } ) as PluginListRow;

describe( 'removePluginsFromSites', () => {
	test( 'removes the deleted plugin from every affected site', () => {
		const response: PluginsResponse = {
			sites: {
				1: [ makePlugin( 'jetpack' ), makePlugin( 'akismet' ) ],
				2: [ makePlugin( 'jetpack' ) ],
			},
		};

		const result = removePluginsFromSites( response, [ makeRow( 'jetpack', [ 1, 2 ] ) ] );

		expect( result?.sites[ 1 ].map( ( p ) => p.id ) ).toEqual( [ 'akismet' ] );
		expect( result?.sites[ 2 ] ).toEqual( [] );
	} );

	test( 'leaves untargeted sites untouched', () => {
		const response: PluginsResponse = {
			sites: {
				1: [ makePlugin( 'jetpack' ) ],
				2: [ makePlugin( 'jetpack' ) ],
			},
		};

		const result = removePluginsFromSites( response, [ makeRow( 'jetpack', [ 1 ] ) ] );

		expect( result?.sites[ 1 ] ).toEqual( [] );
		expect( result?.sites[ 2 ].map( ( p ) => p.id ) ).toEqual( [ 'jetpack' ] );
	} );

	test( 'handles removing several plugins at once', () => {
		const response: PluginsResponse = {
			sites: {
				1: [ makePlugin( 'jetpack' ), makePlugin( 'akismet' ), makePlugin( 'woocommerce' ) ],
			},
		};

		const result = removePluginsFromSites( response, [
			makeRow( 'jetpack', [ 1 ] ),
			makeRow( 'akismet', [ 1 ] ),
		] );

		expect( result?.sites[ 1 ].map( ( p ) => p.id ) ).toEqual( [ 'woocommerce' ] );
	} );

	test( 'returns the response unchanged when there are no sites', () => {
		expect( removePluginsFromSites( undefined, [ makeRow( 'jetpack', [ 1 ] ) ] ) ).toBeUndefined();
	} );
} );
