import { BASIC_CATALOG_ID } from '../../capabilities';
import { createInteractiveUiCatalog } from '../catalog';
import { createInteractiveUiRuntime } from '../runtime';
import type { InteractiveUiMessage } from '../runtime';

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

const onError = jest.fn();

function createRuntime() {
	return createInteractiveUiRuntime( {
		catalogs: [
			createInteractiveUiCatalog(),
			createInteractiveUiCatalog( { catalog: { catalogId: HOST_CATALOG_ID } } ),
		],
		onAction: jest.fn(),
		onError,
	} );
}

beforeEach( () => onError.mockClear() );

it.each( [ new Error( 'Tool failed' ), 'Tool failed' ] )(
	'reports a tool failure with its original surface owner: %p',
	async ( failure ) => {
		const runtime = createInteractiveUiRuntime( {
			catalogs: [ createInteractiveUiCatalog() ],
			actionMode: 'tool-call',
			onAction: async () => {
				runtime.processMessages(
					[ { version: 'v1.0', deleteSurface: { surfaceId: 'first' } } ],
					'message-2'
				);
				throw failure;
			},
			onError,
		} );
		runtime.processMessages( createSurfaceMessages( 'first' ), 'message-1' );

		await runtime.getSurface( 'first' )?.dispatchAction( { event: { name: 'save' } }, 'root' );

		expect( onError.mock.calls ).toEqual( [
			[
				{
					code: 'TOOL_CALL_FAILED',
					message: 'Tool failed',
					surfaceId: 'first',
					expression: 'save',
				},
				'message-1',
			],
		] );
		runtime.dispose();
	}
);

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

	const applied = runtime.processMessages(
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
	);

	expect( applied ).toEqual( [] );
	expect( onError.mock.calls ).toEqual( [
		[
			expect.objectContaining( {
				surfaceId: 'cycle',
				message: expect.stringMatching( /Circular/ ),
			} ),
			'message-1',
		],
	] );
} );

it( "skips the rest of a batch's messages for a surface once one fails", () => {
	const runtime = createRuntime();
	const [ createFirst, updateFirst ] = createSurfaceMessages( 'first' );

	runtime.processMessages( [ createFirst, updateFirst ], 'message-1' );

	const applied = runtime.processMessages(
		[
			createFirst,
			{
				version: 'v1.0',
				updateComponents: {
					surfaceId: 'first',
					components: [ { id: 'root', component: 'Text', text: 'Changed' } ],
				},
			},
		],
		'message-2'
	);

	expect( applied ).toEqual( [] );
	expect( onError.mock.calls ).toEqual( [
		[ expect.objectContaining( { code: 'INTEGRITY_ERROR', surfaceId: 'first' } ), 'message-2' ],
	] );
	expect( runtime.getSurface( 'first' )?.componentsModel.get( 'root' )?.properties.text ).toBe(
		'Hi'
	);
	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [ 'first' ] );
} );

it( "keeps applying a batch's other surfaces after one fails", () => {
	const runtime = createRuntime();
	const second = createSurfaceMessages( 'second' );

	const applied = runtime.processMessages(
		[
			{
				version: 'v1.0',
				updateComponents: { surfaceId: 'missing', components: [ { id: 'root' } ] },
			},
			...second,
		],
		'message-1'
	);

	expect( applied ).toEqual( second );
	expect( onError.mock.calls ).toEqual( [
		[ expect.objectContaining( { surfaceId: 'missing' } ), 'message-1' ],
	] );
	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [ 'second' ] );
} );

it( 'leaves no surface that a rejected `createSurface` made', () => {
	const runtime = createRuntime();

	const applied = runtime.processMessages(
		[
			{
				version: 'v1.0',
				createSurface: {
					surfaceId: 'form',
					catalogId: BASIC_CATALOG_ID,
					sendDataModel: true,
					dataModel: { name: 'Ada' },
					components: [ { id: 'root', component: 'Text', text: 5 } ],
				},
			},
		],
		'message-1'
	);

	expect( applied ).toEqual( [] );
	expect( onError ).toHaveBeenCalledWith(
		expect.objectContaining( { surfaceId: 'form' } ),
		'message-1'
	);
	expect( runtime.getSurfaceIds( 'message-1' ) ).toEqual( [] );
	expect( runtime.getDataModel( [ 'form' ] ) ).toBeUndefined();
} );

it( 'reports each malformed message instead of throwing', () => {
	const runtime = createRuntime();
	const malformed = null as unknown as InteractiveUiMessage;
	const second = createSurfaceMessages( 'second' );

	const applied = runtime.processMessages( [ malformed, malformed, ...second ], 'message-1' );

	expect( applied ).toEqual( second );
	expect( onError ).toHaveBeenCalledTimes( 2 );
} );

it( 'reports a surface’s errors with the owner that created it', async () => {
	const runtime = createRuntime();

	runtime.processMessages( createSurfaceMessages( 'first' ), 'message-1' );
	runtime.processMessages( createSurfaceMessages( 'second' ), 'message-2' );

	await runtime
		.getSurface( 'first' )
		?.dispatchError( { code: 'RENDER_FAILED', message: 'Failed' } );

	expect( onError ).toHaveBeenCalledWith(
		expect.objectContaining( { code: 'RENDER_FAILED', surfaceId: 'first' } ),
		'message-1'
	);
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

function createFormMessages(
	surfaceId: string,
	value: Record< string, unknown >,
	{
		sendDataModel = true,
		passwordBinding = { '@path': '/password' },
	}: { sendDataModel?: boolean; passwordBinding?: { '@path': string } } = {}
): InteractiveUiMessage[] {
	return [
		{
			version: 'v1.0',
			createSurface: { surfaceId, catalogId: BASIC_CATALOG_ID, sendDataModel },
		},
		{ version: 'v1.0', updateDataModel: { surfaceId, path: '/', value } },
		{
			version: 'v1.0',
			updateComponents: {
				surfaceId,
				components: [
					{ id: 'root', component: 'Column', children: [ 'name', 'password' ] },
					{ id: 'name', component: 'TextField', label: 'Name', value: { '@path': '/name' } },
					{
						id: 'password',
						component: 'TextField',
						label: 'Password',
						variant: 'obscured',
						value: passwordBinding,
					},
				],
			},
		},
	];
}

it( 'gives the data model of only the surfaces asked for that send it', () => {
	const runtime = createRuntime();

	runtime.processMessages( createFormMessages( 'form', { name: 'Ada' } ), 'message-1' );
	runtime.processMessages( createFormMessages( 'other', { name: 'Bo' } ), 'message-1' );
	runtime.processMessages(
		createFormMessages( 'quiet', { name: 'Cy' }, { sendDataModel: false } ),
		'message-1'
	);

	expect( runtime.getDataModel( [ 'form', 'quiet', 'missing' ] ) ).toEqual( {
		version: 'v1.0',
		surfaces: { form: { name: 'Ada' } },
	} );
	expect( runtime.getDataModel( [ 'quiet' ] ) ).toBeUndefined();
} );

it( 'leaves out the value an obscured TextField binds to', () => {
	const runtime = createRuntime();

	runtime.processMessages(
		createFormMessages( 'form', { name: 'Ada', password: 'secret' } ),
		'message-1'
	);

	expect( runtime.getDataModel( [ 'form' ] )?.surfaces.form ).toEqual( { name: 'Ada' } );
	expect( runtime.getSurface( 'form' )?.dataModel.get( '/password' ) ).toBe( 'secret' );
} );

it( 'leaves out a surface whose obscured TextField binds a relative path', () => {
	const runtime = createRuntime();

	runtime.processMessages(
		createFormMessages(
			'form',
			{ name: 'Ada', password: 'secret' },
			{ passwordBinding: { '@path': 'password' } }
		),
		'message-1'
	);

	expect( runtime.getDataModel( [ 'form' ] ) ).toBeUndefined();
} );
