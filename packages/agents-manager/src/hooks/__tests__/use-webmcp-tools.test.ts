import { renderHook, waitFor } from '@testing-library/react';
import {
	registerAbility,
	registerAbilityCategory,
	unregisterAbility,
	unregisterAbilityCategory,
} from '@wordpress/abilities';
import apiFetch from '@wordpress/api-fetch';
import { onTestFinished, vi } from 'vitest';
import useWebMcpTools from '../use-webmcp-tools';
import type { ToolProvider } from '../../extension-types';
import type { WebMcpTool } from '../../webmcp/types';
import type { Ability } from '@wordpress/abilities';

const { stopRegistrySubscription } = vi.hoisted( () => ( { stopRegistrySubscription: vi.fn() } ) );

vi.mock( '@wordpress/api-fetch' );

vi.mock( '../../webmcp/registry-ability-provider', async ( importOriginal ) => {
	const actual =
		await importOriginal< typeof import( '../../webmcp/registry-ability-provider' ) >();

	return {
		...actual,
		subscribeToRegistryAbilities: ( listener: () => void ) => {
			const unsubscribe = actual.subscribeToRegistryAbilities( listener );

			return () => {
				stopRegistrySubscription();
				unsubscribe();
			};
		},
	};
} );

const ability: Ability = {
	name: 'big-sky/apply-block-edits',
	label: 'Apply block edits',
	description: 'Apply edits to the current block canvas.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true }, webmcp: { public: true } },
};

describe( 'useWebMcpTools', () => {
	// The hook loads the adapter lazily. Load it before the tests, so the first one doesn't wait
	// on its cold import.
	beforeAll( () => import( '../../webmcp/adapter' ) );

	beforeEach( () => {
		vi.mocked( apiFetch ).mockReset().mockResolvedValue( [] );
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

	it( 'registers on mount and clears stale scope registrations and subscriptions', async () => {
		const registrations: Array< { signal?: AbortSignal; tool: WebMcpTool } > = [];
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: {
				registerTool: vi.fn( async ( tool: WebMcpTool, options?: { signal?: AbortSignal } ) => {
					registrations.push( { signal: options?.signal, tool } );
				} ),
			},
		} );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [ ability ] ),
			executeAbility: vi.fn(),
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
		expect( stopRegistrySubscription ).toHaveBeenCalledTimes( 1 );

		unmount();

		expect( registrations[ 1 ].signal?.aborted ).toBe( true );
		expect( stopRegistrySubscription ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'registers a flagged ability that reaches the registry after mount', async () => {
		const registerTool = vi.fn();
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool },
		} );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [] ),
			executeAbility: vi.fn(),
		};
		const { unmount } = renderHook( () => useWebMcpTools( { toolProvider, scope: 'site-1' } ) );
		onTestFinished( () => {
			unmount();
			unregisterAbility( 'test/late' );
			unregisterAbilityCategory( 'webmcp-test' );
		} );
		await waitFor( () => expect( toolProvider.getAbilities ).toHaveBeenCalled() );

		registerAbilityCategory( 'webmcp-test', { label: 'Test', description: 'Test abilities' } );
		registerAbility( {
			name: 'test/late',
			label: 'Late',
			description: 'Registered after mount.',
			category: 'webmcp-test',
			callback: vi.fn(),
			meta: { webmcp: { public: true } },
		} );

		await waitFor( () =>
			expect( registerTool ).toHaveBeenCalledWith(
				expect.objectContaining( { name: 'test__late' } ),
				expect.anything()
			)
		);
	} );

	it( 'does not load tools outside development mode', async () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: false,
		};
		const registerTool = vi.fn();
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool },
		} );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [ ability ] ),
			executeAbility: vi.fn(),
		};

		const { unmount } = renderHook( () => useWebMcpTools( { toolProvider, scope: 'site-1' } ) );
		await Promise.resolve();

		expect( registerTool ).not.toHaveBeenCalled();

		unmount();
	} );
} );
