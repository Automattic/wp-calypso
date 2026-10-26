import { BASIC_CATALOG_ID } from '../../capabilities';
import { createInteractiveUiCatalog } from '../catalog';
import { createInteractiveUiRuntime } from '../runtime';

const HOST_CATALOG_ID = 'urn:host:catalog:v1';

function createSurfaceMessages( surfaceId: string, catalogId = BASIC_CATALOG_ID ) {
	return [
		{ version: 'v1.0' as const, createSurface: { surfaceId, catalogId } },
		{
			version: 'v1.0' as const,
			updateComponents: {
				surfaceId,
				components: [ { id: 'root', component: 'Text', text: 'Hi' } ],
			},
		},
	];
}

function createRuntime() {
	return createInteractiveUiRuntime( {
		catalogs: [
			createInteractiveUiCatalog(),
			createInteractiveUiCatalog( { catalog: { catalogId: HOST_CATALOG_ID } } ),
		],
		onAction: jest.fn(),
		onError: jest.fn(),
	} );
}

it( 'groups surfaces by the owner that created them', () => {
	const runtime = createRuntime();

	runtime.processMessages( createSurfaceMessages( 'first' ), 'message-1' );
	runtime.processMessages( createSurfaceMessages( 'second' ), 'message-2' );

	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [ 'first' ] );
	expect( runtime.getSurfaceIds( 'message-2' ) ).toEqual( [ 'second' ] );
	expect( runtime.getSurface( 'first' )?.componentsModel.has( 'root' ) ).toBe( true );
} );

it( 'renders each surface with the catalog it names', () => {
	const runtime = createRuntime();

	runtime.processMessages( createSurfaceMessages( 'basic' ), 'message-1' );
	runtime.processMessages( createSurfaceMessages( 'host', HOST_CATALOG_ID ), 'message-1' );

	expect( runtime.getSurface( 'basic' )?.defaultCatalog?.id ).toBe( BASIC_CATALOG_ID );
	expect( runtime.getSurface( 'host' )?.defaultCatalog?.id ).toBe( HOST_CATALOG_ID );
} );

it( 'accepts the A2UI v1.0 properties a basic component ignores, such as weight', () => {
	const runtime = createRuntime();

	runtime.processMessages(
		[
			{ version: 'v1.0', createSurface: { surfaceId: 'weighted', catalogId: BASIC_CATALOG_ID } },
			{
				version: 'v1.0',
				updateComponents: {
					surfaceId: 'weighted',
					components: [
						{
							id: 'root',
							component: 'Text',
							text: 'Hi',
							weight: 1,
							accessibility: { label: 'Hi' },
						},
					],
				},
			},
		],
		'message-1'
	);

	expect( runtime.getSurface( 'weighted' )?.componentsModel.has( 'root' ) ).toBe( true );
} );

it( 'rejects an update that makes a cycle with earlier components', () => {
	const runtime = createRuntime();

	runtime.processMessages(
		[
			{
				version: 'v1.0',
				createSurface: {
					surfaceId: 'cycle',
					catalogId: BASIC_CATALOG_ID,
					components: [
						{ id: 'root', component: 'Card', child: 'outer' },
						{ id: 'outer', component: 'Card', child: 'inner' },
						{ id: 'inner', component: 'Text', text: 'Hi' },
					],
				},
			},
		],
		'message-1'
	);

	expect( () =>
		runtime.processMessages(
			[
				{
					version: 'v1.0',
					updateComponents: {
						surfaceId: 'cycle',
						components: [ { id: 'inner', component: 'Card', child: 'outer' } ],
					},
				},
			],
			'message-1'
		)
	).toThrow( /Circular reference/ );
} );

it( 'forgets a deleted surface', () => {
	const runtime = createRuntime();

	runtime.processMessages( createSurfaceMessages( 'first' ), 'message-1' );
	runtime.processMessages(
		[ { version: 'v1.0', deleteSurface: { surfaceId: 'first' } } ],
		'message-1'
	);

	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [] );
} );
