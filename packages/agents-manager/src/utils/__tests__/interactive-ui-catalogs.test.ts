import * as renderer from '@automattic/ai-ui-renderer';
import { BASIC_CATALOG_ID } from '@automattic/ai-ui-renderer/capabilities';
import {
	AGENTS_MANAGER_CATALOG_ID,
	createInteractiveUiCatalogs,
	filterInteractiveUiCatalogs,
	getInteractiveUiCapabilities,
} from '../interactive-ui-catalogs';
import type { InteractiveUiCatalogDefinition } from '@automattic/ai-ui-renderer';

const WOO_CATALOG_ID = 'urn:automattic:woocommerce-ai:interactive-ui:v1';

function createCatalog(
	catalogId: string,
	components: InteractiveUiCatalogDefinition[ 'components' ] = { WooAiProductCard: () => null }
): InteractiveUiCatalogDefinition {
	return {
		catalog: { catalogId, components: { WooAiProductCard: { type: 'object' } } },
		components,
	};
}

afterEach( () => jest.restoreAllMocks() );

it( 'builds the Basic catalog, Agents Manager’s and each provider’s', () => {
	const catalogs = createInteractiveUiCatalogs( renderer, [ createCatalog( WOO_CATALOG_ID ) ] );

	expect( catalogs.map( ( { id } ) => id ) ).toEqual( [
		BASIC_CATALOG_ID,
		AGENTS_MANAGER_CATALOG_ID,
		WOO_CATALOG_ID,
	] );
} );

it( 'skips a catalog that fails to build, and keeps the others', () => {
	const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

	const catalogs = createInteractiveUiCatalogs( renderer, [
		createCatalog( 'urn:broken:v1', {} ),
		createCatalog( WOO_CATALOG_ID ),
	] );

	expect( catalogs.map( ( { id } ) => id ) ).toEqual( [
		BASIC_CATALOG_ID,
		AGENTS_MANAGER_CATALOG_ID,
		WOO_CATALOG_ID,
	] );
	expect( consoleError ).toHaveBeenCalledWith(
		'[AgentsManager] Failed to build the interactive UI catalog urn:broken:v1:',
		expect.any( Error )
	);
} );

it( 'keeps only valid provider catalogs, the first with each ID', () => {
	const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	const first = createCatalog( WOO_CATALOG_ID );

	const catalogs = filterInteractiveUiCatalogs( [
		first,
		createCatalog( WOO_CATALOG_ID ),
		createCatalog( AGENTS_MANAGER_CATALOG_ID ),
		createCatalog( BASIC_CATALOG_ID ),
		createCatalog( 'urn:broken:v1', {} ),
		{} as InteractiveUiCatalogDefinition,
	] );

	expect( catalogs ).toEqual( [ first ] );
	expect( consoleError ).toHaveBeenCalledTimes( 5 );
	expect( consoleError ).toHaveBeenCalledWith(
		'[AgentsManager] Skipped an interactive UI catalog:',
		new Error( 'The interactive UI component WooAiProductCard has no implementation.' )
	);
} );

it( 'describes the catalogs the chat renders as A2UI renderer capabilities', () => {
	const wooCatalog = createCatalog( WOO_CATALOG_ID );

	expect( getInteractiveUiCapabilities( [ wooCatalog ] ) ).toEqual( {
		'v1.0': {
			supportedCatalogIds: [ BASIC_CATALOG_ID, AGENTS_MANAGER_CATALOG_ID, WOO_CATALOG_ID ],
			inlineCatalogs: [
				{ catalogId: AGENTS_MANAGER_CATALOG_ID, protocolVersion: '1.0' },
				{ ...wooCatalog.catalog, protocolVersion: '1.0' },
			],
		},
	} );
} );
