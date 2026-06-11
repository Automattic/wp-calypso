/**
 * @jest-environment jsdom
 */
import {
	loadExternalProviders,
	mergeCapabilitiesInto,
	mergeContextProviders,
	mergeUseSuggestionsHooks,
} from '../load-external-providers';
import type { ProviderCapabilities, UseSuggestionsHook } from '../load-external-providers';

// Mirrors the real manifest shipped by packages/jetpack-ai-sidebar/src/index.ts.
const jetpackCompositionManifest = {
	providerId: 'jetpack-ai-sidebar',
	role: 'guest' as const,
	supportedAgentIds: [ 'wp-orchestrator', 'wpcom-workflow-unified_chat' ],
	claims: {
		abilities: [ 'jetpack_ai' ],
		components: [ 'title-picker', 'review-mediation' ],
		context: [ 'titleSuggestionCount' ],
	},
};

function getProviderCompositionPolicy( data: unknown ) {
	return ( data as { providerCompositionPolicy?: unknown } ).providerCompositionPolicy;
}

describe( 'mergeCapabilitiesInto', () => {
	it( 'is a no-op when capabilities is undefined', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, undefined );
		expect( merged ).toEqual( {} );
	} );

	it( 'is a no-op when capabilities is null or not an object', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, null );
		mergeCapabilitiesInto( merged, 'oops' );
		mergeCapabilitiesInto( merged, 42 );
		expect( merged ).toEqual( {} );
	} );

	it( 'sets supportsSplitScreen when the provider declares it', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, { supportsSplitScreen: true } );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );

	it( 'leaves supportsSplitScreen unset when the provider declares false', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		expect( merged.supportsSplitScreen ).toBeUndefined();
	} );

	it( 'rejects truthy non-boolean values (untyped runtime modules)', () => {
		const merged: ProviderCapabilities = {};
		// A misconfigured external module exporting a stringified flag must not
		// silently opt in via JavaScript truthiness.
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 'false' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 'true' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 1 } );
		expect( merged.supportsSplitScreen ).toBeUndefined();
	} );

	it( 'OR-merges across providers — any true wins', () => {
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		mergeCapabilitiesInto( merged, {} );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: true } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: false } );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );

	it( 'reads capabilities via property access (Proxy-safe)', () => {
		// Mirrors the lazy proxy shape used by jetpack-ai-sidebar.provider.mjs.
		// Object.entries() on this Proxy returns [], so the function must
		// probe each known key by direct access to hit the get trap.
		const lazyCapabilities = new Proxy(
			{},
			{ get: ( _target, prop ) => ( prop === 'supportsSplitScreen' ? true : undefined ) }
		);
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, lazyCapabilities );
		expect( merged.supportsSplitScreen ).toBe( true );
	} );
} );

describe( 'mergeContextProviders', () => {
	it( 'preserves earlier provider editor context while filling missing fields from later providers', () => {
		const provider = mergeContextProviders( [
			{
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					environment: 'wp-admin',
					currentScreen: {
						url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					},
					currentPageContent: [ { id: 'big-sky-block' } ],
					selectedBlockClientId: 'short-selected-id',
					contextEntries: [
						{
							id: 'big-sky-page-context',
							type: 'big-sky-page-context',
						},
					],
				} ),
			},
			{
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					environment: 'gutenberg',
					titleSuggestionCount: 3,
					currentScreen: {
						postType: 'page',
					},
					currentPageContent: [ { id: 'jetpack-block' } ],
					selectedBlockClientId: 'short-selected-id',
					contextEntries: [
						{
							id: 'selected-block-content',
							type: 'selected-block-content',
							data: { content: 'Selected text' },
						},
					],
				} ),
			},
		] );

		expect( provider?.getClientContext() ).toEqual(
			expect.objectContaining( {
				environment: 'wp-admin',
				titleSuggestionCount: 3,
				currentScreen: {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					postType: 'page',
				},
				currentPageContent: [ { id: 'big-sky-block' } ],
				selectedBlockClientId: 'short-selected-id',
				contextEntries: [
					{
						id: 'big-sky-page-context',
						type: 'big-sky-page-context',
					},
					{
						id: 'selected-block-content',
						type: 'selected-block-content',
						data: { content: 'Selected text' },
					},
				],
			} )
		);
	} );

	it( 'keeps earlier provider selected block id when later selected-block context is present', () => {
		const provider = mergeContextProviders( [
			{
				getClientContext: () => ( {
					environment: 'wp-admin',
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					selectedBlockClientId: 'short-selected-id',
				} ),
			},
			{
				getClientContext: () => ( {
					environment: 'gutenberg',
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					selectedBlockClientId: 'raw-selected-id',
					contextEntries: [
						{
							id: 'selected-block-content',
							type: 'selected-block-content',
							data: { content: 'Selected text' },
						},
					],
				} ),
			},
		] );

		expect( provider?.getClientContext() ).toEqual(
			expect.objectContaining( {
				environment: 'wp-admin',
				selectedBlockClientId: 'short-selected-id',
			} )
		);
	} );
} );

describe( 'loadExternalProviders', () => {
	afterEach( () => {
		delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData;
		delete ( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it( 'does not merge external editor providers into Reader Chat', async () => {
		const agentsManagerData = {
			agentId: 'reader-chat',
			agentProviders: [ 'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar.provider.mjs' ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;
		( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( providers.toolProvider ).toBeUndefined();
		expect( providers.contextProvider ).toBeUndefined();
		expect( providers.useSuggestions ).toEqual( expect.any( Function ) );
	} );

	it( 'does not freeze provider abilities before hook-dependent abilities register', async () => {
		let showComponentRegistered = false;
		const executeAbility = jest.fn().mockResolvedValue( { result: { provider: 'big-sky' } } );
		const provider = {
			toolProvider: {
				getAbilities: jest.fn( async () =>
					showComponentRegistered ? [ { name: 'big-sky/show-component' } ] : []
				),
				executeAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ provider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( provider.toolProvider.getAbilities ).not.toHaveBeenCalled();
		expect( await providers.toolProvider?.getAbilities() ).toEqual( [] );

		showComponentRegistered = true;

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
		] );

		await providers.toolProvider?.executeAbility( 'big_sky__show_component', {
			type: 'color-picker',
		} );

		expect( executeAbility ).toHaveBeenCalledWith( 'big-sky/show-component', {
			type: 'color-picker',
		} );
	} );

	it( 'composes tool providers in registration order with first-provider-wins duplicates', async () => {
		const firstExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'first' } } );
		const secondExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'second' } } );
		const firstProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [
					{ name: 'wpcom/update-block-content', label: 'First shared' },
					{ name: 'first-only', label: 'First only' },
				] ),
				executeAbility: firstExecuteAbility,
			},
		};
		const secondProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [
					{ name: 'wpcom/update-block-content', label: 'Second shared' },
					{ name: 'second-only', label: 'Second only' },
				] ),
				executeAbility: secondExecuteAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ firstProvider, secondProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();
		const abilities = await providers.toolProvider?.getAbilities();

		expect( abilities ).toEqual( [
			{ name: 'wpcom/update-block-content', label: 'First shared' },
			{ name: 'first-only', label: 'First only' },
			{ name: 'second-only', label: 'Second only' },
		] );

		await providers.toolProvider?.executeAbility( 'wpcom__update_block_content', {} );
		await providers.toolProvider?.executeAbility( 'second-only', {} );

		expect( firstExecuteAbility ).toHaveBeenCalledWith( 'wpcom/update-block-content', {} );
		expect( secondExecuteAbility ).toHaveBeenCalledWith( 'second-only', {} );
	} );

	it( 'keeps the first provider for equivalent raw and normalized non-show-component ability names', async () => {
		const firstExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'first' } } );
		const secondExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'second' } } );
		const firstProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'wpcom__update_block_content' } ] ),
				executeAbility: firstExecuteAbility,
			},
		};
		const secondProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'wpcom/update-block-content' } ] ),
				executeAbility: secondExecuteAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ firstProvider, secondProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'wpcom__update_block_content' },
		] );

		await providers.toolProvider?.executeAbility( 'wpcom/update-block-content', {} );

		expect( firstExecuteAbility ).toHaveBeenCalledWith( 'wpcom__update_block_content', {} );
		expect( secondExecuteAbility ).not.toHaveBeenCalled();
	} );

	it( 'keeps host ownership of show-component because the guest claims exclude its legacy alias', async () => {
		const bigSkyResult = {
			result: { provider: 'big-sky' },
			returnToAgent: true,
			agentMessage: JSON.stringify( {
				tool_id: 'big_sky__show_component',
				data: { type: 'color-picker' },
			} ),
		};
		const bigSkyExecuteAbility = jest.fn().mockResolvedValue( bigSkyResult );
		const jetpackExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'jetpack' } } );
		const BigSkyColorPicker = () => null;
		const JetpackTitlePicker = () => null;
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest
					.fn()
					.mockResolvedValue( [
						{ name: 'jetpack_ai__show_component' },
						{ name: 'big_sky__show_component' },
					] ),
				executeAbility: jetpackExecuteAbility,
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? JetpackTitlePicker : null
			),
		};
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: bigSkyExecuteAbility,
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'color-picker' ? BigSkyColorPicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ jetpackProvider, bigSkyProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		const abilities = await providers.toolProvider?.getAbilities();
		expect( abilities ).toEqual( [
			{ name: 'jetpack_ai__show_component' },
			{ name: 'big-sky/show-component' },
		] );
		const bigSkyShowComponentAbility = abilities?.find(
			( ability ) => ability.name === 'big-sky/show-component'
		);

		expect( bigSkyShowComponentAbility?.callback ).toEqual( expect.any( Function ) );
		await expect(
			bigSkyShowComponentAbility?.callback?.( { type: 'color-picker' } )
		).resolves.toBe( bigSkyResult );

		await providers.toolProvider?.executeAbility( 'big_sky__show_component', {
			type: 'color-picker',
		} );
		await providers.toolProvider?.executeAbility( 'big-sky-show-component', {
			type: 'font-picker',
		} );

		expect( bigSkyExecuteAbility ).toHaveBeenCalledWith( 'big-sky/show-component', {
			type: 'color-picker',
		} );
		expect( bigSkyExecuteAbility ).toHaveBeenCalledWith( 'big-sky/show-component', {
			type: 'font-picker',
		} );
		expect( jetpackExecuteAbility ).not.toHaveBeenCalledWith(
			'big_sky__show_component',
			expect.anything()
		);
		expect(
			providers.getChatComponent?.( 'color-picker', { toolId: 'big_sky__show_component' } )
		).toBe( BigSkyColorPicker );
		expect(
			providers.getChatComponent?.( 'color-picker', { toolId: 'big-sky-show-component' } )
		).toBe( BigSkyColorPicker );
		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'jetpack_ai__show_component' } )
		).toBe( JetpackTitlePicker );
	} );

	it( 'continues loading later providers when one provider import fails', async () => {
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation();
		const provider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'second-only' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ 'https://example.invalid/missing-provider.mjs', provider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [ { name: 'second-only' } ] );
		expect( warnSpy ).toHaveBeenCalledWith(
			expect.stringContaining( 'Failed to load provider' ),
			expect.anything()
		);

		warnSpy.mockRestore();
	} );

	it( 'continues composing later providers when one provider returns invalid abilities', async () => {
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation();
		const badProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( undefined ),
				executeAbility: jest.fn(),
			},
		};
		const goodProvider = {
			toolProvider: {
				getAbilities: jest
					.fn()
					.mockResolvedValue( [ { name: 'good-provider/tool' }, { label: 'Missing name' } ] ),
				executeAbility: jest.fn().mockResolvedValue( { result: { provider: 'good' } } ),
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ badProvider, goodProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'good-provider/tool' },
		] );
		await providers.toolProvider?.executeAbility( 'good_provider__tool', {} );
		expect( goodProvider.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'good-provider/tool',
			{}
		);
		expect( warnSpy ).toHaveBeenCalledWith(
			'[AgentsManager] Provider returned invalid abilities; expected array.'
		);

		warnSpy.mockRestore();
	} );

	it( 'keeps last successful provider abilities when execution-time refresh fails', async () => {
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation();
		let shouldFailRefresh = false;
		const executeAbility = jest.fn().mockResolvedValue( { result: { provider: 'jetpack' } } );
		const provider = {
			toolProvider: {
				getAbilities: jest.fn( async () => {
					if ( shouldFailRefresh ) {
						throw new Error( 'transient provider failure' );
					}
					return [ { name: 'jetpack-ai/show-component' } ];
				} ),
				executeAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ provider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'jetpack-ai/show-component' },
		] );

		shouldFailRefresh = true;

		await providers.toolProvider?.executeAbility( 'jetpack_ai__show_component', {
			type: 'title-picker',
		} );

		expect( executeAbility ).toHaveBeenCalledWith( 'jetpack-ai/show-component', {
			type: 'title-picker',
		} );
		expect( warnSpy ).toHaveBeenCalledWith(
			'[AgentsManager] Failed to load abilities from provider:',
			expect.any( Error )
		);

		warnSpy.mockRestore();
	} );

	it( 'adds callbacks for a single provider so UI agent messages are promoted', async () => {
		const bigSkyResult = {
			result: { success: true, message: 'Pick a palette.' },
			returnToAgent: true,
			agentMessage: JSON.stringify( {
				tool_id: 'big_sky__show_component',
				data: { type: 'color-picker' },
			} ),
		};
		const bigSkyExecuteAbility = jest.fn().mockResolvedValue( bigSkyResult );
		const BigSkyColorPicker = () => null;
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: bigSkyExecuteAbility,
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'color-picker' ? BigSkyColorPicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'dolly',
			agentProviders: [ bigSkyProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();
		const abilities = await providers.toolProvider?.getAbilities();
		const showComponentAbility = abilities?.find(
			( ability ) => ability.name === 'big-sky/show-component'
		);

		expect( abilities ).toEqual( [ { name: 'big-sky/show-component' } ] );
		expect( showComponentAbility?.callback ).toEqual( expect.any( Function ) );
		await expect( showComponentAbility?.callback?.( { type: 'color-picker' } ) ).resolves.toBe(
			bigSkyResult
		);
		expect( bigSkyExecuteAbility ).toHaveBeenCalledWith( 'big-sky/show-component', {
			type: 'color-picker',
		} );
		expect(
			providers.getChatComponent?.( 'color-picker', { toolId: 'big_sky__show_component' } )
		).toBe( BigSkyColorPicker );
	} );

	it( 'loads Jetpack AI by itself when no host provider is present', async () => {
		const JetpackTitlePicker = () => null;
		const jetpackToolProvider = {
			getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
			executeAbility: jest.fn().mockResolvedValue( { result: { provider: 'jetpack' } } ),
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: jetpackToolProvider,
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? JetpackTitlePicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();
		const abilities = await providers.toolProvider?.getAbilities();

		expect( abilities ).toEqual( [ { name: 'jetpack_ai__show_component' } ] );
		expect( abilities?.[ 0 ]?.callback ).toEqual( expect.any( Function ) );
		await providers.toolProvider?.executeAbility( 'jetpack_ai__show_component', {} );
		expect( jetpackToolProvider.executeAbility ).toHaveBeenCalledWith(
			'jetpack_ai__show_component',
			{}
		);
		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'jetpack_ai__show_component' } )
		).toBe( JetpackTitlePicker );
		expect( getProviderCompositionPolicy( agentsManagerData ) ).toBeUndefined();
	} );

	it( 'routes claimed abilities, components, and context keys to the guest provider', async () => {
		const bigSkyExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'big-sky' } } );
		const jetpackExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'jetpack' } } );
		const BigSkyColorPicker = () => null;
		const JetpackTitlePicker = () => null;
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest
					.fn()
					.mockResolvedValue( [
						{ name: 'big-sky/show-component' },
						{ name: 'jetpack_ai__show_component', label: 'Host copy should not win' },
					] ),
				executeAbility: bigSkyExecuteAbility,
			},
			contextProvider: {
				getClientContext: () => ( {
					environment: 'wp-admin',
					selectedBlockClientId: 'big-sky-selected-block',
					titleSuggestionCount: 1,
				} ),
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'color-picker' ? BigSkyColorPicker : null
			),
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest
					.fn()
					.mockResolvedValue( [
						{ name: 'jetpack_ai__show_component' },
						{ name: 'wpcom/search' },
					] ),
				executeAbility: jetpackExecuteAbility,
			},
			contextProvider: {
				getClientContext: () => ( {
					environment: 'gutenberg',
					selectedBlockClientId: 'jetpack-selected-block',
					titleSuggestionCount: 3,
				} ),
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? JetpackTitlePicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ bigSkyProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
			{ name: 'jetpack_ai__show_component' },
		] );

		await providers.toolProvider?.executeAbility( 'jetpack_ai__show_component', {} );
		await providers.toolProvider?.executeAbility( 'big_sky__show_component', {} );

		expect( jetpackExecuteAbility ).toHaveBeenCalledWith( 'jetpack_ai__show_component', {} );
		expect( bigSkyExecuteAbility ).toHaveBeenCalledWith( 'big-sky/show-component', {} );
		expect( providers.contextProvider?.getClientContext() ).toEqual(
			expect.objectContaining( {
				environment: 'wp-admin',
				selectedBlockClientId: 'big-sky-selected-block',
				titleSuggestionCount: 3,
			} )
		);
		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'jetpack_ai__show_component' } )
		).toBe( JetpackTitlePicker );
		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'big_sky__show_component' } )
		).toBe( JetpackTitlePicker );
		expect(
			providers.getChatComponent?.( 'color-picker', { toolId: 'big_sky__show_component' } )
		).toBe( BigSkyColorPicker );
		expect( getProviderCompositionPolicy( agentsManagerData ) ).toEqual( {
			guests: [
				{
					providerIndex: 1,
					providerId: 'jetpack-ai-sidebar',
					claims: jetpackCompositionManifest.claims,
				},
			],
		} );
	} );

	it( 'skips the Jetpack AI guest when the active agent is unsupported', async () => {
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation();
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
			contextProvider: {
				getClientContext: () => ( { environment: 'wp-admin' } ),
			},
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn(),
			},
			contextProvider: {
				getClientContext: () => ( { titleSuggestionCount: 3 } ),
			},
		};
		const agentsManagerData = {
			agentId: 'unsupported-agent',
			agentProviders: [ bigSkyProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
		] );
		expect( jetpackProvider.toolProvider.getAbilities ).not.toHaveBeenCalled();
		expect( providers.contextProvider?.getClientContext() ).toEqual( { environment: 'wp-admin' } );
		expect( getProviderCompositionPolicy( agentsManagerData ) ).toBeUndefined();
		expect( warnSpy ).toHaveBeenCalledWith(
			'[AgentsManager] Guest provider "jetpack-ai-sidebar" does not support agent "unsupported-agent"; provider skipped.'
		);

		warnSpy.mockRestore();
	} );

	it( 'composes a guest with multiple host providers', async () => {
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const otherProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'other-provider/search' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn().mockResolvedValue( { result: { provider: 'jetpack' } } ),
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ bigSkyProvider, otherProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
			{ name: 'other-provider/search' },
			{ name: 'jetpack_ai__show_component' },
		] );
		await providers.toolProvider?.executeAbility( 'jetpack_ai__show_component', {} );
		expect( jetpackProvider.toolProvider.executeAbility ).toHaveBeenCalledWith(
			'jetpack_ai__show_component',
			{}
		);
		expect( getProviderCompositionPolicy( agentsManagerData ) ).toEqual( {
			guests: [
				{
					providerIndex: 2,
					providerId: 'jetpack-ai-sidebar',
					claims: jetpackCompositionManifest.claims,
				},
			],
		} );
	} );

	it( 'drops a later guest whose claims conflict with an earlier guest', async () => {
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation();
		const hostProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const conflictingProvider = {
			compositionManifest: {
				providerId: 'jetpack-ai-imposter',
				role: 'guest' as const,
				claims: { abilities: [ 'jetpack_ai' ] },
			},
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__imposter' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ hostProvider, jetpackProvider, conflictingProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
			{ name: 'jetpack_ai__show_component' },
		] );
		expect( conflictingProvider.toolProvider.getAbilities ).not.toHaveBeenCalled();
		expect( warnSpy ).toHaveBeenCalledWith(
			'[AgentsManager] Guest provider "jetpack-ai-imposter" claims ability namespace "jetpack_ai" already claimed by "jetpack-ai-sidebar"; provider skipped.'
		);

		warnSpy.mockRestore();
	} );

	it( 'runs host resolveOutgoingArgs over guest-bound calls but not host-bound calls', async () => {
		const hostExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'big-sky' } } );
		const jetpackExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'jetpack' } } );
		const hostProvider = {
			resolveOutgoingArgs: jest.fn( ( toolName: string, args: unknown ) => {
				const record = args as Record< string, unknown >;
				return typeof record?.clientId === 'string' && record.clientId === 'B7'
					? { ...record, clientId: 'real-client-id-1234' }
					: args;
			} ),
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: hostExecuteAbility,
			},
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jetpackExecuteAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ hostProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		// Guest-bound call: the host's translator rewrites the short id.
		await providers.toolProvider?.executeAbility( 'jetpack_ai__show_component', {
			clientId: 'B7',
			tone: 'friendly',
		} );
		expect( jetpackExecuteAbility ).toHaveBeenCalledWith( 'jetpack_ai__show_component', {
			clientId: 'real-client-id-1234',
			tone: 'friendly',
		} );

		// The guest ability's callback path translates too.
		const abilities = await providers.toolProvider?.getAbilities();
		const guestAbility = abilities?.find(
			( ability ) => ability.name === 'jetpack_ai__show_component'
		);
		await guestAbility?.callback?.( { clientId: 'B7' } );
		expect( jetpackExecuteAbility ).toHaveBeenCalledWith( 'jetpack_ai__show_component', {
			clientId: 'real-client-id-1234',
		} );

		// Host-bound call: args pass through untouched.
		await providers.toolProvider?.executeAbility( 'big_sky__show_component', {
			clientId: 'B7',
		} );
		expect( hostExecuteAbility ).toHaveBeenCalledWith( 'big-sky/show-component', {
			clientId: 'B7',
		} );
	} );

	it( 'parses a lazy-proxy compositionManifest like the widgets.wp.com wrapper produces', async () => {
		// The deployed jetpack-ai-sidebar.provider.mjs re-exports the manifest
		// as a Proxy over window.__JetpackAIProvider; the policy must resolve
		// the guest through that indirection.
		const proxiedManifest = new Proxy(
			{},
			{
				get: ( _, prop: string ) =>
					( jetpackCompositionManifest as Record< string, unknown > )[ prop ],
			}
		);
		const hostProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const jetpackProvider = {
			compositionManifest: proxiedManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ hostProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		await loadExternalProviders();

		expect( getProviderCompositionPolicy( agentsManagerData ) ).toEqual( {
			guests: [
				{
					providerIndex: 1,
					providerId: 'jetpack-ai-sidebar',
					claims: jetpackCompositionManifest.claims,
				},
			],
		} );
	} );

	it( 'composes a supported guest when no inline agent id is set (default agent applies)', async () => {
		const jetpackExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'jetpack' } } );
		const hostProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jetpackExecuteAbility,
			},
		};
		// No agentId anywhere: the effective agent falls back to the default
		// orchestrator, which the guest supports — so it must not be dropped.
		const agentsManagerData = {
			agentProviders: [ hostProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
			{ name: 'jetpack_ai__show_component' },
		] );
	} );

	it( 'gates guests against the caller-resolved agent id when provided', async () => {
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const hostProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		// Inline data carries no agent id; the caller resolved unified chat,
		// which the Jetpack manifest supports.
		const agentsManagerData = {
			agentProviders: [ hostProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders( 'wpcom-workflow-unified_chat' );

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
			{ name: 'jetpack_ai__show_component' },
		] );
	} );

	it( 'runs every provider checkpoint hook and returns the host checkpoint API', async () => {
		const hostCheckpointApi = { setCheckpoint: jest.fn() };
		const guestCheckpointApi = { setCheckpoint: jest.fn() };
		const hostUseCheckpoint = jest.fn().mockReturnValue( hostCheckpointApi );
		const guestUseCheckpoint = jest.fn().mockReturnValue( guestCheckpointApi );
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			useCheckpoint: guestUseCheckpoint,
		};
		const hostProvider = {
			useCheckpoint: hostUseCheckpoint,
		};
		// Guest registered first: the host's API must still win while the
		// guest's hook still runs (its module-level side effects register).
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ jetpackProvider, hostProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( providers.useCheckpoint?.() ).toBe( hostCheckpointApi );
		expect( hostUseCheckpoint ).toHaveBeenCalledTimes( 1 );
		expect( guestUseCheckpoint ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'routes claimed ability names to the guest even before the guest lists them', async () => {
		const hostProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
		};
		const jetpackExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'jetpack' } } );
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				// The guest has not registered the tool yet (hook-dependent
				// registration), but its claim still owns the namespace.
				getAbilities: jest.fn().mockResolvedValue( [] ),
				executeAbility: jetpackExecuteAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ hostProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		await providers.toolProvider?.executeAbility( 'jetpack_ai__late_tool', { input: 'x' } );

		expect( jetpackExecuteAbility ).toHaveBeenCalledWith( 'jetpack_ai__late_tool', {
			input: 'x',
		} );
	} );

	it( 'promotes nested provider agent messages returned by executeAbility', async () => {
		const agentMessage = JSON.stringify( {
			tool_id: 'jetpack_ai__show_component',
			data: { type: 'title-picker' },
		} );
		const jetpackExecuteAbility = jest.fn().mockResolvedValue( {
			result: {
				result: 'Component displayed successfully',
				returnToAgent: false,
				agentMessage,
			},
			returnToAgent: false,
		} );
		const jetpackProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jetpackExecuteAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();
		const abilities = await providers.toolProvider?.getAbilities();
		const showComponentAbility = abilities?.find(
			( ability ) => ability.name === 'jetpack_ai__show_component'
		);

		await expect(
			showComponentAbility?.callback?.( {
				type: 'title-picker',
			} )
		).resolves.toEqual(
			expect.objectContaining( {
				agentMessage,
			} )
		);
		expect( jetpackExecuteAbility ).toHaveBeenCalledWith( 'jetpack_ai__show_component', {
			type: 'title-picker',
		} );
	} );

	it( 'routes claimed component types to the claiming guest regardless of the source tool', async () => {
		const BigSkyTitlePicker = () => null;
		const JetpackTitlePicker = () => null;
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? BigSkyTitlePicker : null
			),
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn(),
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? JetpackTitlePicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ bigSkyProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();
		await providers.toolProvider?.getAbilities();

		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'jetpack_ai__show_component' } )
		).toBe( JetpackTitlePicker );
		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'big_sky__show_component' } )
		).toBe( JetpackTitlePicker );
		expect( providers.getChatComponent?.( 'title-picker' ) ).toBe( JetpackTitlePicker );
	} );

	it( 'composes Big Sky and Jetpack context providers without replacing Big Sky editor context', async () => {
		const bigSkyProvider = {
			contextProvider: {
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					environment: 'wp-admin',
					currentPageContent: [ { id: 'big-sky-block' } ],
					selectedBlockClientId: 'short-selected-id',
				} ),
			},
		};
		const jetpackProvider = {
			contextProvider: {
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php?post=1&action=edit',
					pathname: '/wp-admin/post.php',
					search: '?post=1&action=edit',
					environment: 'gutenberg',
					titleSuggestionCount: 3,
					selectedBlockClientId: 'raw-selected-id',
					contextEntries: [
						{
							id: 'selected-block-content',
							type: 'selected-block-content',
							data: { content: 'Selected text' },
						},
					],
				} ),
			},
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ bigSkyProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( providers.contextProvider?.getClientContext() ).toEqual(
			expect.objectContaining( {
				environment: 'wp-admin',
				titleSuggestionCount: 3,
				currentPageContent: [ { id: 'big-sky-block' } ],
				selectedBlockClientId: 'short-selected-id',
				contextEntries: [
					{
						id: 'selected-block-content',
						type: 'selected-block-content',
						data: { content: 'Selected text' },
					},
				],
			} )
		);
	} );

	it( 'falls through to Jetpack for legacy show-component messages with Jetpack-only component types', async () => {
		const BigSkyFontPicker = () => null;
		const JetpackTitlePicker = () => null;
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: jest.fn(),
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'font-picker' ? BigSkyFontPicker : null
			),
		};
		const jetpackProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jest.fn(),
			},
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? JetpackTitlePicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ bigSkyProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'big_sky__show_component' } )
		).toBe( JetpackTitlePicker );
		expect(
			providers.getChatComponent?.( 'font-picker', { toolId: 'big_sky__show_component' } )
		).toBe( BigSkyFontPicker );
	} );

	it( 'routes claimed component types to the guest when a component-only host is registered first', async () => {
		const HostNextStepButton = () => null;
		const JetpackTitlePicker = () => null;
		const hostProvider = {
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'next-step-button' ? HostNextStepButton : null
			),
		};
		const jetpackToolProvider = {
			getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
			executeAbility: jest.fn(),
		};
		const jetpackProvider = {
			compositionManifest: jetpackCompositionManifest,
			toolProvider: jetpackToolProvider,
			getChatComponent: jest.fn( ( type: string ) =>
				type === 'title-picker' ? JetpackTitlePicker : null
			),
		};
		const agentsManagerData = {
			agentId: 'wp-orchestrator',
			agentProviders: [ hostProvider, jetpackProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();
		await providers.toolProvider?.getAbilities();

		expect(
			providers.getChatComponent?.( 'title-picker', { toolId: 'jetpack_ai__show_component' } )
		).toBe( JetpackTitlePicker );
		expect( providers.getChatComponent?.( 'next-step-button' ) ).toBe( HostNextStepButton );
	} );

	it( 'composes a third provider under Unified Chat without changing Big Sky or Jetpack ownership', async () => {
		const bigSkyExecuteAbility = jest.fn().mockResolvedValue( { result: { provider: 'big-sky' } } );
		const jetpackExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'jetpack' } } );
		const unifiedChatExecuteAbility = jest
			.fn()
			.mockResolvedValue( { result: { provider: 'unified-chat' } } );
		const bigSkyProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'big-sky/show-component' } ] ),
				executeAbility: bigSkyExecuteAbility,
			},
		};
		const jetpackProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'jetpack_ai__show_component' } ] ),
				executeAbility: jetpackExecuteAbility,
			},
		};
		const unifiedChatProvider = {
			toolProvider: {
				getAbilities: jest.fn().mockResolvedValue( [ { name: 'unified-chat/search' } ] ),
				executeAbility: unifiedChatExecuteAbility,
			},
		};
		const agentsManagerData = {
			agentId: 'wpcom-workflow-unified_chat',
			agentProviders: [ bigSkyProvider, jetpackProvider, unifiedChatProvider ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;
		( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		const providers = await loadExternalProviders();

		expect( await providers.toolProvider?.getAbilities() ).toEqual( [
			{ name: 'big-sky/show-component' },
			{ name: 'jetpack_ai__show_component' },
			{ name: 'unified-chat/search' },
		] );

		await providers.toolProvider?.executeAbility( 'jetpack_ai__show_component', {} );
		await providers.toolProvider?.executeAbility( 'unified_chat__search', {} );

		expect( jetpackExecuteAbility ).toHaveBeenCalledWith( 'jetpack_ai__show_component', {} );
		expect( unifiedChatExecuteAbility ).toHaveBeenCalledWith( 'unified-chat/search', {} );
		expect( bigSkyExecuteAbility ).not.toHaveBeenCalled();
	} );
} );

describe( 'mergeUseSuggestionsHooks', () => {
	it( 'treats undefined provider hook results as no suggestions', () => {
		const undefinedHook = jest.fn( () => undefined ) as UseSuggestionsHook;
		const suggestionsHook = jest.fn( () => ( {
			suggestions: [ { id: 'reader-followup', label: 'Follow up', prompt: 'Follow up on this.' } ],
		} ) ) as UseSuggestionsHook;

		const merged = mergeUseSuggestionsHooks( [ undefinedHook, suggestionsHook ] );

		expect( merged?.() ).toEqual( {
			suggestions: [ { id: 'reader-followup', label: 'Follow up', prompt: 'Follow up on this.' } ],
		} );
	} );

	it( 'dedupes suggestions by id when multiple providers return suggestions', () => {
		const firstHook = jest.fn( () => ( {
			suggestions: [
				{ id: 'shared', label: 'First shared', prompt: 'First shared prompt.' },
				{ id: 'first-only', label: 'First only', prompt: 'First only prompt.' },
			],
		} ) ) as UseSuggestionsHook;
		const secondHook = jest.fn( () => ( {
			suggestions: [
				{ id: 'shared', label: 'Second shared', prompt: 'Second shared prompt.' },
				{ id: 'second-only', label: 'Second only', prompt: 'Second only prompt.' },
			],
		} ) ) as UseSuggestionsHook;

		const merged = mergeUseSuggestionsHooks( [ firstHook, secondHook ] );

		expect( merged?.() ).toEqual( {
			suggestions: [
				{ id: 'shared', label: 'First shared', prompt: 'First shared prompt.' },
				{ id: 'first-only', label: 'First only', prompt: 'First only prompt.' },
				{ id: 'second-only', label: 'Second only', prompt: 'Second only prompt.' },
			],
		} );
	} );

	it( 'forwards suggestion visibility options to provider hooks', () => {
		const firstHook = jest.fn( () => ( { suggestions: [] } ) ) as UseSuggestionsHook;
		const secondHook = jest.fn( () => ( { suggestions: [] } ) ) as UseSuggestionsHook;
		const merged = mergeUseSuggestionsHooks( [ firstHook, secondHook ] );
		const options = { suggestionsVisible: false };

		merged?.( undefined, options );

		expect( firstHook ).toHaveBeenCalledWith( undefined, options );
		expect( secondHook ).toHaveBeenCalledWith( undefined, options );
	} );
} );
