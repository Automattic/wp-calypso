import * as renderer from '@automattic/ai-ui-renderer';
import { BASIC_CATALOG_ID } from '@automattic/ai-ui-renderer/capabilities';
import { render, screen, waitFor } from '@testing-library/react';
import { ButtonPicker, ColorPicker, FontPicker } from '../../components/style-pickers';
import * as tracks from '../../utils/tracks';
import {
	AGENTS_MANAGER_CATALOG_ID,
	createInteractiveUiCatalogs,
	filterInteractiveUiCatalogs,
	getInteractiveUiCapabilities,
} from '../catalogs';
import type { InteractiveUiCatalogDefinition } from '@automattic/ai-ui-renderer';

jest.mock( '../../components/style-pickers', () => ( {
	ButtonPicker: jest.fn( () => null ),
	ColorPicker: jest.fn( () => null ),
	FontPicker: jest.fn( () => null ),
} ) );

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

afterAll( () => {
	// The real Tracks module was spied on; let later suites install their own mocks.
	jest.resetModules();
} );

it( 'builds the Basic catalog, Agents Manager’s and each provider’s', () => {
	const catalogs = createInteractiveUiCatalogs( renderer, [ createCatalog( WOO_CATALOG_ID ) ] );

	expect( catalogs.map( ( { id } ) => id ) ).toEqual( [
		BASIC_CATALOG_ID,
		AGENTS_MANAGER_CATALOG_ID,
		WOO_CATALOG_ID,
	] );
} );

it( 'records the shared response event when a provider’s component renders', async () => {
	const recordBigSkyTracksEvent = jest
		.spyOn( tracks, 'recordBigSkyTracksEvent' )
		.mockImplementation( () => undefined );
	const catalogs = createInteractiveUiCatalogs( renderer, [
		createCatalog( WOO_CATALOG_ID, { WooAiProductCard: () => <p>Product</p> } ),
	] );
	const runtime = renderer.createInteractiveUiRuntime( {
		catalogs,
		onAction: jest.fn(),
		onError: jest.fn(),
	} );

	runtime.processMessages(
		[
			{
				version: 'v1.0',
				createSurface: {
					surfaceId: 'product',
					catalogId: WOO_CATALOG_ID,
					components: [ { id: 'root', component: 'WooAiProductCard' } ],
				},
			},
		],
		'message'
	);

	render(
		<renderer.InteractiveUiSurface
			surface={ runtime.getSurface( 'product' )! }
			hostProps={ { isMessageStale: false } }
		/>
	);

	expect( await screen.findByText( 'Product' ) ).toBeVisible();
	expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
		'jetpack_big_sky_chat_response_rendered',
		{
			component_type: 'WooAiProductCard',
			tool_id: 'wpcom__render_interactive_ui',
			tool_call_id: 'product',
		}
	);
} );

it( 'renders the style pickers with the props their abilities send', async () => {
	jest.spyOn( tracks, 'recordBigSkyTracksEvent' ).mockImplementation( () => undefined );
	const onError = jest.fn();
	const runtime = renderer.createInteractiveUiRuntime( {
		catalogs: createInteractiveUiCatalogs( renderer ),
		onAction: jest.fn(),
		onError,
	} );
	const variations = [ { title: 'Bold', settings: { color: { palette: { theme: [] } } } } ];

	runtime.processMessages(
		[
			{
				version: 'v1.0',
				createSurface: {
					surfaceId: 'pickers',
					catalogId: AGENTS_MANAGER_CATALOG_ID,
					components: [
						{ id: 'root', component: 'Column', children: [ 'colors', 'fonts', 'buttons' ] },
						{ id: 'colors', component: 'AgentsManagerColorPicker', variations },
						{
							id: 'fonts',
							component: 'AgentsManagerFontPicker',
							themeVariations: variations,
							dynamicVariations: variations,
						},
						{
							id: 'buttons',
							component: 'AgentsManagerButtonPicker',
							buttonVariations: variations,
							maxButtonsToShow: 6,
						},
					],
				},
			},
		],
		'message'
	);

	render( <renderer.InteractiveUiSurface surface={ runtime.getSurface( 'pickers' )! } /> );

	await waitFor( () => expect( ButtonPicker ).toHaveBeenCalled() );

	expect( jest.mocked( ColorPicker ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
		variations,
		surfaceId: 'pickers',
	} );
	expect( jest.mocked( FontPicker ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
		themeVariations: variations,
		dynamicVariations: variations,
	} );
	expect( jest.mocked( ButtonPicker ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
		buttonVariations: variations,
		maxButtonsToShow: 6,
	} );
	expect( onError ).not.toHaveBeenCalled();
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

it( 'describes the catalogs the chat renders as A2UI renderer capabilities, listing an ability-only catalog by ID only', () => {
	const wooCatalog = {
		catalog: {
			catalogId: WOO_CATALOG_ID,
			components: {
				WooAiProductCard: {
					type: 'object',
					properties: { name: { type: 'string' } },
					required: [ 'name' ],
				},
				WooAiDivider: {},
				WooAiBadge: {
					type: 'object',
					properties: { component: { const: 'WooAiBadge' } },
					required: [ 'component' ],
				},
			},
			functions: {
				wooAiOpenProduct: { type: 'object', returnType: 'void', requiresUserActivation: undefined },
				wooAiFormatPrice: {
					type: 'object',
					returnType: 'string',
					requiresUserActivation: false,
				},
			},
		},
	};

	expect( getInteractiveUiCapabilities( [ wooCatalog ] ) ).toEqual( {
		'v1.0': {
			supportedCatalogIds: [ BASIC_CATALOG_ID, AGENTS_MANAGER_CATALOG_ID, WOO_CATALOG_ID ],
			inlineCatalogs: [
				{
					$id: WOO_CATALOG_ID,
					catalogId: WOO_CATALOG_ID,
					protocolVersion: '1.0',
					components: {
						WooAiProductCard: {
							type: 'object',
							properties: { name: { type: 'string' }, component: { const: 'WooAiProductCard' } },
							required: [ 'component', 'name' ],
						},
						WooAiDivider: {
							type: 'object',
							properties: { component: { const: 'WooAiDivider' } },
							required: [ 'component' ],
						},
						WooAiBadge: {
							type: 'object',
							properties: { component: { const: 'WooAiBadge' } },
							required: [ 'component' ],
						},
					},
					functions: {
						wooAiOpenProduct: {
							requiresUserActivation: true,
							type: 'object',
							returnType: 'void',
							properties: { '@call': { const: 'wooAiOpenProduct' } },
							required: [ '@call' ],
						},
						wooAiFormatPrice: {
							requiresUserActivation: false,
							type: 'object',
							returnType: 'string',
							properties: { '@call': { const: 'wooAiFormatPrice' } },
							required: [ '@call' ],
						},
					},
				},
			],
		},
	} );
} );
