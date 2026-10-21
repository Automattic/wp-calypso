import { basicCatalog } from '@a2ui/react/v0_9';
import { createInteractiveUiCatalog } from '../catalog';
import { createInteractiveUiRuntime } from '../runtime';

function createSurfaceMessages( surfaceId: string ) {
	return [
		{ version: 'v0.9' as const, createSurface: { surfaceId, catalogId: basicCatalog.id } },
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
		catalog: createInteractiveUiCatalog(),
		onAction: jest.fn(),
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

it( 'forgets a deleted surface', () => {
	const runtime = createRuntime();
	runtime.processMessages( createSurfaceMessages( 'first' ), 'message-1' );

	runtime.processMessages(
		[ { version: 'v0.9', deleteSurface: { surfaceId: 'first' } } ],
		'message-1'
	);

	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [] );
} );
