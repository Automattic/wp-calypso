import { createWebMcpAdapter, normalizeInputSchema, shouldExposeWebMcpAbility } from '../adapter';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpModelContext, WebMcpTool } from '../types';

const createAbility = ( overrides: Partial< Ability > = {} ): Ability => ( {
	name: 'big-sky/apply-block-edits',
	label: 'Apply block edits',
	description: 'Apply deterministic edits to the current block canvas.',
	category: 'big-sky',
	input_schema: {
		type: 'object',
		properties: { edits: { type: 'array' } },
	},
	meta: {
		annotations: {
			clientRegistered: true,
			readonly: false,
		},
	},
	...overrides,
} );

function createHarness( initialAbilities: Ability[] = [ createAbility() ] ) {
	let abilities = initialAbilities;
	const tools = new Map< string, WebMcpTool >();
	const signals = new Map< string, AbortSignal | undefined >();
	const toolProvider: ToolProvider = {
		getAbilities: jest.fn( async () => abilities ),
		executeAbility: jest.fn( async ( _name, input ) => ( { input } ) ),
	};
	const modelContext: WebMcpModelContext = {
		registerTool: jest.fn( async ( tool, options ) => {
			tools.set( tool.name, tool );
			signals.set( tool.name, options?.signal );
		} ),
	};
	const adapter = createWebMcpAdapter( { toolProvider, modelContext } );

	return {
		adapter,
		modelContext,
		setAbilities: ( next: Ability[] ) => {
			abilities = next;
		},
		signals,
		toolProvider,
		tools,
	};
}

describe( 'WebMCP adapter', () => {
	it( 'normalizes missing and malformed input schemas', () => {
		expect( normalizeInputSchema( undefined ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( 'invalid' ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( [] ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( { properties: { value: { type: 'string' } } } ) ).toEqual( {
			properties: { value: { type: 'string' } },
			type: 'object',
		} );
		expect( normalizeInputSchema( { anyOf: [ { type: 'string' } ] } ) ).toEqual( {
			anyOf: [ { type: 'string' } ],
		} );
		expect( normalizeInputSchema( { oneOf: [ { type: 'number' } ] } ) ).toEqual( {
			oneOf: [ { type: 'number' } ],
		} );
	} );

	it( 'requires both the explicit allowlist and client provenance', () => {
		expect( shouldExposeWebMcpAbility( createAbility() ) ).toBe( true );
		expect(
			shouldExposeWebMcpAbility( createAbility( { meta: undefined, callback: jest.fn() } ) )
		).toBe( true );
		expect( shouldExposeWebMcpAbility( createAbility( { name: 'big-sky/save-post' } ) ) ).toBe(
			false
		);
		expect(
			shouldExposeWebMcpAbility(
				createAbility( {
					meta: { annotations: { serverRegistered: true, clientRegistered: true } },
				} )
			)
		).toBe( false );
		expect(
			shouldExposeWebMcpAbility(
				createAbility( { meta: { annotations: {} }, callback: undefined } )
			)
		).toBe( false );
	} );

	it( 'registers mapped metadata and executes through the provider with the original name', async () => {
		const harness = createHarness();
		await harness.adapter.sync();

		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 1 );
		const tool = harness.tools.get( 'big_sky__apply_block_edits' );
		expect( tool ).toMatchObject( {
			name: 'big_sky__apply_block_edits',
			title: 'Apply block edits',
			description: 'Apply deterministic edits to the current block canvas.',
			inputSchema: {
				type: 'object',
				properties: { edits: { type: 'array' } },
			},
			annotations: { readOnlyHint: false },
		} );

		const input = { edits: [ { clientId: 'block-1' } ] };
		await expect( tool?.execute( input ) ).resolves.toEqual( { input } );
		expect( harness.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'big-sky/apply-block-edits',
			input
		);
	} );

	it( 'returns structured provider results without double encoding', async () => {
		const harness = createHarness();
		const result = { result: { success: true }, returnToAgent: true };
		( harness.toolProvider.executeAbility as jest.Mock ).mockResolvedValue( result );
		await harness.adapter.sync();

		await expect( harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {} ) ).resolves.toBe(
			result
		);
	} );

	it( 'preserves provider execution rejections', async () => {
		const harness = createHarness();
		const error = new Error( 'Canvas rejected the edit' );
		( harness.toolProvider.executeAbility as jest.Mock ).mockRejectedValue( error );
		await harness.adapter.sync();

		await expect( harness.tools.get( 'big_sky__apply_block_edits' )?.execute( {} ) ).rejects.toBe(
			error
		);
	} );

	it( 'does not dispatch an already-aborted execution', async () => {
		const harness = createHarness();
		await harness.adapter.sync();
		const controller = new AbortController();
		controller.abort();

		await expect(
			harness.tools
				.get( 'big_sky__apply_block_edits' )
				?.execute( {}, { signal: controller.signal } )
		).rejects.toMatchObject( { name: 'AbortError' } );
		expect( harness.toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'reconciles late, removed, and changed abilities without duplicates', async () => {
		const harness = createHarness( [] );
		await harness.adapter.sync();
		expect( harness.modelContext.registerTool ).not.toHaveBeenCalled();

		harness.setAbilities( [ createAbility() ] );
		await harness.adapter.sync();
		await harness.adapter.sync();
		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 1 );

		const firstSignal = harness.signals.get( 'big_sky__apply_block_edits' );
		harness.setAbilities( [ createAbility( { description: 'Updated description' } ) ] );
		await harness.adapter.sync();
		expect( firstSignal?.aborted ).toBe( true );
		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 2 );

		const secondSignal = harness.signals.get( 'big_sky__apply_block_edits' );
		harness.setAbilities( [] );
		await harness.adapter.sync();
		expect( secondSignal?.aborted ).toBe( true );
	} );

	it( 'serializes overlapping synchronization', async () => {
		const harness = createHarness();
		let releaseFirst: () => void = () => {};
		( harness.toolProvider.getAbilities as jest.Mock )
			.mockImplementationOnce(
				() =>
					new Promise< Ability[] >(
						( resolve ) => ( releaseFirst = () => resolve( [ createAbility() ] ) )
					)
			)
			.mockResolvedValue( [ createAbility() ] );

		const first = harness.adapter.sync();
		await Promise.resolve();
		const second = harness.adapter.sync();
		releaseFirst();
		await Promise.all( [ first, second ] );

		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 1 );
		expect( harness.toolProvider.getAbilities ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'disposal unregisters every owned tool', async () => {
		const harness = createHarness();
		await harness.adapter.sync();
		const signal = harness.signals.get( 'big_sky__apply_block_edits' );

		harness.adapter.dispose();
		expect( signal?.aborted ).toBe( true );
		await expect( harness.adapter.sync() ).resolves.toBeUndefined();
	} );

	it( 'surfaces registration failures and can retry them', async () => {
		const harness = createHarness();
		( harness.modelContext.registerTool as jest.Mock )
			.mockRejectedValueOnce( new Error( 'Invalid WebMCP schema' ) )
			.mockResolvedValueOnce( undefined );

		await expect( harness.adapter.sync() ).rejects.toThrow( 'Invalid WebMCP schema' );
		await expect( harness.adapter.sync() ).resolves.toBeUndefined();
		expect( harness.modelContext.registerTool ).toHaveBeenCalledTimes( 2 );
	} );
} );
