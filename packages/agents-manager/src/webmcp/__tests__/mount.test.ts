import apiFetch from '@wordpress/api-fetch';
import { subscribe } from '@wordpress/data';
import { mountWebMcpTools } from '../mount';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpModelContext, WebMcpTool } from '../types';

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
	let listener: ( () => unknown ) | undefined;

	beforeEach( () => {
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

	function createHarness( toolProvider?: ToolProvider ) {
		const registrations: Array< { signal?: AbortSignal; tool: WebMcpTool } > = [];
		const modelContext: WebMcpModelContext = {
			registerTool: jest.fn( async ( tool, options ) => {
				registrations.push( { signal: options?.signal, tool } );
			} ),
		};
		const onSyncError = jest.fn();
		const runtime = mountWebMcpTools( {
			getToolProvider: () => toolProvider,
			modelContext,
			onSyncError,
		} );

		return { modelContext, onSyncError, registrations, runtime };
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
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
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
} );
