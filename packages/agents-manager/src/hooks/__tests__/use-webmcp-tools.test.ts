import { renderHook, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import useWebMcpTools from '../use-webmcp-tools';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpTool } from '../../webmcp/types';

jest.mock( '@wordpress/api-fetch' );

const ability: Ability = {
	name: 'big-sky/apply-block-edits',
	label: 'Apply block edits',
	description: 'Apply edits to the current block canvas.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true } },
};

describe( 'useWebMcpTools', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockReset().mockResolvedValue( [] );
		document.body.className = 'site-editor-php';
		window.history.replaceState( {}, '', '/' );
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		Object.defineProperty( navigator, 'modelContext', { configurable: true, value: undefined } );
	} );

	afterEach( () => {
		delete ( globalThis as { agentsManagerData?: unknown } ).agentsManagerData;
		Object.defineProperty( document, 'modelContext', { configurable: true, value: undefined } );
	} );

	it( 'registers on mount and clears stale scope registrations', async () => {
		const registrations: Array< { signal?: AbortSignal; tool: WebMcpTool } > = [];
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: {
				registerTool: jest.fn( async ( tool: WebMcpTool, options?: { signal?: AbortSignal } ) => {
					registrations.push( { signal: options?.signal, tool } );
				} ),
			},
		} );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ ability ] ),
			executeAbility: jest.fn(),
		};

		const { rerender, unmount } = renderHook(
			( { scope } ) => useWebMcpTools( { toolProvider, scope } ),
			{ initialProps: { scope: 'site-1' } }
		);

		await waitFor( () => expect( registrations ).toHaveLength( 1 ) );
		expect( registrations[ 0 ].tool.name ).toBe( 'big_sky__apply_block_edits' );

		rerender( { scope: 'site-2' } );
		await waitFor( () => {
			expect( registrations[ 0 ].signal?.aborted ).toBe( true );
			expect( registrations ).toHaveLength( 2 );
		} );

		unmount();
		expect( registrations[ 1 ].signal?.aborted ).toBe( true );
	} );

	it( 'does not load tools outside development mode', async () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: false,
		};
		const registerTool = jest.fn();
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool },
		} );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ ability ] ),
			executeAbility: jest.fn(),
		};

		const { unmount } = renderHook( () => useWebMcpTools( { toolProvider, scope: 'site-1' } ) );
		await Promise.resolve();
		expect( registerTool ).not.toHaveBeenCalled();
		unmount();
	} );
} );
