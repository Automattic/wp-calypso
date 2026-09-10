import { renderHook, waitFor } from '@testing-library/react';
import {
	registerAbility,
	registerAbilityCategory,
	unregisterAbility,
	unregisterAbilityCategory,
} from '@wordpress/abilities';
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

	it( 'follows the abilities registry without polling', async () => {
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
			getAbilities: jest.fn( async () => [] ),
			executeAbility: jest.fn(),
		};

		const { unmount } = renderHook( () => useWebMcpTools( { toolProvider, scope: 'site-1' } ) );
		await waitFor( () => expect( toolProvider.getAbilities ).toHaveBeenCalled() );
		expect( registrations ).toHaveLength( 0 );

		registerAbilityCategory( 'demo', { label: 'Demo', description: 'Demo abilities.' } );
		registerAbility( {
			name: 'demo/read-panel',
			label: 'Read panel',
			description: 'Read the demo panel.',
			category: 'demo',
			input_schema: { type: 'object', properties: {} },
			meta: { public: true, annotations: { readonly: true } },
			callback: async () => ( { tone: 'calm' } ),
		} );

		await waitFor( () => expect( registrations ).toHaveLength( 1 ) );
		expect( registrations[ 0 ].tool.name ).toBe( 'demo__read_panel' );
		await expect( registrations[ 0 ].tool.execute( {} ) ).resolves.toEqual( { tone: 'calm' } );
		expect( toolProvider.executeAbility ).not.toHaveBeenCalled();

		unregisterAbility( 'demo/read-panel' );
		await waitFor( () => expect( registrations[ 0 ].signal?.aborted ).toBe( true ) );

		unmount();
		unregisterAbilityCategory( 'demo' );
	} );

	it( 're-syncs when the provider chain arrives', async () => {
		const registrations: WebMcpTool[] = [];
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: {
				registerTool: jest.fn( async ( tool: WebMcpTool ) => {
					registrations.push( tool );
				} ),
			},
		} );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ ability ] ),
			executeAbility: jest.fn(),
		};

		const { rerender, unmount } = renderHook(
			( { provider }: { provider?: ToolProvider } ) =>
				useWebMcpTools( { toolProvider: provider, scope: 'site-1' } ),
			{ initialProps: { provider: undefined } as { provider?: ToolProvider } }
		);
		await waitFor( () => expect( apiFetch ).toHaveBeenCalled() );
		expect( registrations ).toHaveLength( 0 );

		rerender( { provider: toolProvider } );
		await waitFor( () => expect( registrations ).toHaveLength( 1 ) );
		expect( registrations[ 0 ].name ).toBe( 'big_sky__apply_block_edits' );
		unmount();
	} );
} );
