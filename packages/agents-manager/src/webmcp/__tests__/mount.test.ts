import { getAbilities, executeAbility } from '@wordpress/abilities';
import apiFetch from '@wordpress/api-fetch';
import { subscribe } from '@wordpress/data';
import { mountWebMcpTools } from '../mount';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpAdapter, WebMcpModelContext, WebMcpTool } from '../types';

jest.mock( '@wordpress/api-fetch' );
jest.mock( '@wordpress/blocks', () => ( { parse: jest.fn() } ) );
jest.mock( '@wordpress/abilities', () => ( {
	executeAbility: jest.fn(),
	getAbilities: jest.fn( () => [] ),
	store: { name: 'core/abilities' },
} ) );
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	subscribe: jest.fn(),
} ) );

const ability: Ability = {
	name: 'big-sky/apply-block-edits',
	label: 'Apply block edits',
	description: 'Apply edits to the current block canvas.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true } },
};

describe( 'mountWebMcpTools', () => {
	const unsubscribe = jest.fn();
	const runtimes: WebMcpAdapter[] = [];
	let listener: ( () => unknown ) | undefined;

	beforeEach( () => {
		jest.useFakeTimers();
		jest.mocked( getAbilities ).mockReset().mockReturnValue( [] );
		jest.mocked( executeAbility ).mockReset().mockResolvedValue( {} );
		jest.mocked( apiFetch ).mockReset().mockResolvedValue( [] );
		unsubscribe.mockReset();
		listener = undefined;
		jest
			.mocked( subscribe )
			.mockReset()
			.mockImplementation( ( callback ) => {
				listener = callback;
				return unsubscribe;
			} );
	} );

	afterEach( () => {
		runtimes.splice( 0 ).forEach( ( runtime ) => runtime.dispose() );
		jest.useRealTimers();
	} );

	function createHarness( toolProvider?: ToolProvider ) {
		let currentProvider = toolProvider;
		const registrations: Array< { signal?: AbortSignal; tool: WebMcpTool } > = [];
		const modelContext: WebMcpModelContext = {
			registerTool: jest.fn( async ( tool, options ) => {
				registrations.push( { signal: options?.signal, tool } );
			} ),
		};
		const onSyncError = jest.fn();
		const runtime = mountWebMcpTools( {
			getToolProvider: () => currentProvider,
			modelContext,
			onSyncError,
		} );

		runtimes.push( runtime );
		return {
			modelContext,
			onSyncError,
			registrations,
			runtime,
			setProvider: ( provider: ToolProvider ) => {
				currentProvider = provider;
			},
		};
	}

	it( 'syncs on mount and on every abilities store change', async () => {
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ ability ] ),
			executeAbility: jest.fn(),
		};
		const harness = createHarness( toolProvider );

		expect( subscribe ).toHaveBeenCalledWith( expect.any( Function ), {
			name: 'core/abilities',
		} );
		await harness.runtime.sync();
		expect( harness.registrations ).toHaveLength( 1 );
		expect( harness.registrations[ 0 ].tool.name ).toBe( 'big_sky__apply_block_edits' );

		const readsBefore = jest.mocked( toolProvider.getAbilities ).mock.calls.length;
		await listener?.();
		expect( toolProvider.getAbilities ).toHaveBeenCalledTimes( readsBefore + 1 );
		expect( harness.registrations ).toHaveLength( 1 );
		expect( harness.onSyncError ).not.toHaveBeenCalled();
	} );

	it( 'reports a failed sync and keeps serving later ones', async () => {
		const toolProvider: ToolProvider = {
			getAbilities: jest
				.fn()
				.mockRejectedValueOnce( new Error( 'Provider unavailable' ) )
				.mockResolvedValue( [ ability ] ),
			executeAbility: jest.fn(),
		};
		const harness = createHarness( toolProvider );

		// A sync requested in the same tick joins the initial one, so let that
		// one settle before asking again.
		await jest.advanceTimersByTimeAsync( 0 );
		expect( harness.onSyncError ).toHaveBeenCalledWith( expect.any( Error ) );
		expect( harness.registrations ).toHaveLength( 0 );

		await harness.runtime.sync();
		expect( harness.registrations ).toHaveLength( 1 );
		expect( harness.onSyncError ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disposes the subscription and the registrations together', async () => {
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ ability ] ),
			executeAbility: jest.fn(),
		};
		const harness = createHarness( toolProvider );
		await harness.runtime.sync();
		const [ registration ] = harness.registrations;

		harness.runtime.dispose();

		expect( unsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( registration.signal?.aborted ).toBe( true );
	} );
	it( 'preserves a REST opt-out ahead of a public registry copy', async () => {
		jest.mocked( apiFetch ).mockResolvedValue( [
			{
				...ability,
				meta: { webmcp: { public: false }, annotations: { readonly: true } },
			},
		] );
		jest.mocked( getAbilities ).mockReturnValue( [ ability ] );
		const harness = createHarness();
		await harness.runtime.sync();

		expect( harness.registrations ).toHaveLength( 0 );
	} );

	it( 'preserves a provider opt-out ahead of a public registry copy', async () => {
		jest.mocked( getAbilities ).mockReturnValue( [ ability ] );
		const harness = createHarness( {
			getAbilities: async () => [ { ...ability, meta: { webmcp: { public: false } } } ],
			executeAbility: jest.fn(),
		} );
		await harness.runtime.sync();

		expect( harness.registrations ).toHaveLength( 0 );
	} );

	it( 'rejects a stale definition at dispatch once a recovered REST source wins', async () => {
		const readAbility: Ability = {
			...ability,
			name: 'demo/read-note',
			meta: { public: true, annotations: { clientRegistered: true, readonly: true } },
		};
		jest.mocked( getAbilities ).mockReturnValue( [ readAbility ] );
		jest
			.mocked( apiFetch )
			.mockRejectedValueOnce( new Error( 'Temporary failure' ) )
			.mockResolvedValueOnce( [
				{
					...readAbility,
					meta: { webmcp: { public: true, consequential: true }, annotations: { readonly: false } },
				},
			] )
			.mockResolvedValue( {} );
		const harness = createHarness();
		await jest.advanceTimersByTimeAsync( 0 );
		expect( harness.onSyncError ).toHaveBeenCalledTimes( 1 );
		const original = harness.registrations[ 0 ];
		expect( original.tool.annotations.readOnlyHint ).toBe( true );

		await expect( original.tool.execute( {} ) ).rejects.toThrow( 'WebMCP tool changed' );
		expect( executeAbility ).not.toHaveBeenCalled();
		expect( original.signal?.aborted ).toBe( true );
		const replacement = harness.registrations[ 1 ].tool;
		expect( replacement.annotations ).toMatchObject( {
			readOnlyHint: false,
			consequentialHint: true,
		} );
		await replacement.execute( {} );
		expect( apiFetch ).toHaveBeenLastCalledWith( expect.objectContaining( { method: 'POST' } ) );
	} );

	it( 'dispatches to the live owner when the provider changes with identical metadata', async () => {
		const first: ToolProvider = {
			getAbilities: async () => [ ability ],
			executeAbility: jest.fn(),
		};
		const second: ToolProvider = {
			getAbilities: async () => [ ability ],
			executeAbility: jest.fn(),
		};
		const harness = createHarness( first );
		await harness.runtime.sync();
		harness.setProvider( second );
		await harness.runtime.sync();

		expect( harness.registrations ).toHaveLength( 1 );
		expect( harness.registrations[ 0 ].signal?.aborted ).toBe( false );
		await harness.registrations[ 0 ].tool.execute( {} );
		expect( second.executeAbility ).toHaveBeenCalledTimes( 1 );
		expect( first.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'reports a failed REST discovery, keeps the other sources, and fetches again on the next sync', async () => {
		jest.mocked( getAbilities ).mockReturnValue( [ ability ] );
		jest.mocked( apiFetch ).mockRejectedValueOnce( new Error( 'Offline' ) ).mockResolvedValue( [] );
		const harness = createHarness();
		await jest.advanceTimersByTimeAsync( 0 );

		expect( harness.onSyncError ).toHaveBeenCalledWith( expect.any( Error ) );
		expect( harness.registrations ).toHaveLength( 1 );
		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( jest.getTimerCount() ).toBe( 0 );

		await listener?.();
		expect( apiFetch ).toHaveBeenCalledTimes( 2 );
		expect( harness.onSyncError ).toHaveBeenCalledTimes( 1 );
		expect( harness.registrations ).toHaveLength( 1 );
	} );
} );
