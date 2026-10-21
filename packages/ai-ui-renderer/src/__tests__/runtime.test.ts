import { basicCatalog } from '@a2ui/react/v0_9';
import { createInteractiveUiCatalog } from '../catalog';
import { createInteractiveUiRuntime } from '../runtime';

const HOST_CATALOG_ID = 'urn:host:catalog:v1';

function createSurfaceMessages( surfaceId: string, catalogId = basicCatalog.id ) {
	return [
		{ version: 'v0.9' as const, createSurface: { surfaceId, catalogId } },
		{
			version: 'v0.9' as const,
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
			createInteractiveUiCatalog( { id: HOST_CATALOG_ID } ),
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

	expect( runtime.getSurface( 'basic' )?.defaultCatalog.id ).toBe( basicCatalog.id );
	expect( runtime.getSurface( 'host' )?.defaultCatalog.id ).toBe( HOST_CATALOG_ID );
} );

it( 'forgets a deleted surface', () => {
	const runtime = createRuntime();
	runtime.processMessages( createSurfaceMessages( 'first' ), 'message-1' );

	runtime.processMessages(
		[ { version: 'v0.9', deleteSurface: { surfaceId: 'first' } } ],
		'message-1'
	);

	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [] );
} );
