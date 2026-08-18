import { mapApiPluginsToDataViewPlugins } from '../map-api-plugins-to-dataview';
import type { PluginItem, PluginsResponse, Site } from '@automattic/api-core';

const makePlugin = ( id: string, active = true ): PluginItem =>
	( { id, slug: id, name: id, active } ) as PluginItem;

const makeSite = ( ID: number ): Site => ( { ID } ) as Site;

describe( 'mapApiPluginsToDataViewPlugins', () => {
	test( 'only counts sites the dashboard can display', () => {
		const sitesById = new Map( [ [ 1, makeSite( 1 ) ] ] );
		const response: PluginsResponse = {
			sites: {
				1: [ makePlugin( 'jetpack' ) ],
				2: [ makePlugin( 'jetpack' ) ],
			},
		};

		const [ row ] = mapApiPluginsToDataViewPlugins( sitesById, response );

		expect( row.sitesCount ).toBe( 1 );
		expect( row.siteIds ).toEqual( [ 1 ] );
		expect( row.sitesWithPluginActive ).toEqual( [ 1 ] );
	} );

	test( 'drops plugins that are only installed on sites the dashboard cannot display', () => {
		const sitesById = new Map( [ [ 1, makeSite( 1 ) ] ] );
		const response: PluginsResponse = {
			sites: {
				1: [ makePlugin( 'jetpack' ) ],
				2: [ makePlugin( 'akismet' ) ],
			},
		};

		const rows = mapApiPluginsToDataViewPlugins( sitesById, response );

		expect( rows.map( ( row ) => row.id ) ).toEqual( [ 'jetpack' ] );
	} );
} );
