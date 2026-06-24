/**
 * @jest-environment jsdom
 */
import {
	loadExternalProviders,
	mergeCapabilitiesInto,
	mergeUseSuggestionsHooks,
} from '../load-external-providers';
import type { Ability } from '../../extension-types';
import type { ProviderCapabilities, UseSuggestionsHook } from '../load-external-providers';

function setAgentsManagerData( data: Record< string, unknown > ) {
	( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData = data;
	( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData = data;
}

function createAbility( name: string ): Ability {
	return {
		name,
		label: name,
		description: `${ name } description`,
		category: 'test',
	};
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
		setAgentsManagerData( agentsManagerData );

		const providers = await loadExternalProviders();

		expect( providers.toolProvider ).toBeUndefined();
		expect( providers.contextProvider ).toBeUndefined();
		expect( providers.useSuggestions ).toEqual( expect.any( Function ) );
	} );

	it( 'treats malformed agentProviders data as no providers', async () => {
		setAgentsManagerData( {
			agentProviders: 'not-an-array',
		} );

		await expect( loadExternalProviders() ).resolves.toEqual( {} );
	} );

	it( 'merges abilities from multiple tool providers and dispatches execution to the owner', async () => {
		const firstProvider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'host/navigate' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'host' } ) ),
		};
		const secondProvider = {
			getAbilities: jest.fn( () =>
				Promise.resolve( [ createAbility( 'woocommerce/get-products' ) ] )
			),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'woo' } ) ),
		};
		setAgentsManagerData( {
			agentProviders: [ { toolProvider: firstProvider }, { toolProvider: secondProvider } ],
		} );

		const providers = await loadExternalProviders();

		await expect( providers.toolProvider?.getAbilities() ).resolves.toEqual( [
			createAbility( 'host/navigate' ),
			createAbility( 'woocommerce/get-products' ),
		] );
		await expect(
			providers.toolProvider?.executeAbility( 'woocommerce__get_products', { limit: 5 } )
		).resolves.toEqual( { handledBy: 'woo' } );
		expect( firstProvider.executeAbility ).not.toHaveBeenCalled();
		expect( secondProvider.executeAbility ).toHaveBeenCalledWith( 'woocommerce__get_products', {
			limit: 5,
		} );
	} );

	it( 'keeps the earlier tool provider on duplicate ability names', async () => {
		const firstProvider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'shared/action' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'first' } ) ),
		};
		const secondProvider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'shared/action' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'second' } ) ),
		};
		setAgentsManagerData( {
			agentProviders: [ { toolProvider: firstProvider }, { toolProvider: secondProvider } ],
		} );

		const providers = await loadExternalProviders();

		await expect( providers.toolProvider?.getAbilities() ).resolves.toEqual( [
			createAbility( 'shared/action' ),
		] );
		await expect( providers.toolProvider?.executeAbility( 'shared/action', {} ) ).resolves.toEqual(
			{
				handledBy: 'first',
			}
		);
		expect( firstProvider.executeAbility ).toHaveBeenCalled();
		expect( secondProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'returns valid IDs for loaded providers and ignores missing, empty, and duplicate IDs', async () => {
		setAgentsManagerData( {
			agentProviders: [
				{ providerId: 'jetpack-ai-sidebar', getEmptyViewSuggestions: () => [] },
				{ providerId: '', getEmptyViewSuggestions: () => [] },
				{ providerId: 'woocommerce-ai', getEmptyViewSuggestions: () => [] },
				{ getEmptyViewSuggestions: () => [] },
				{ providerId: 'jetpack-ai-sidebar', getEmptyViewSuggestions: () => [] },
				{ providerId: 123, getEmptyViewSuggestions: () => [] },
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.providerIds ).toEqual( [ 'jetpack-ai-sidebar', 'woocommerce-ai' ] );
	} );

	it( 'merges context from multiple context providers', async () => {
		setAgentsManagerData( {
			agentProviders: [
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/site-editor.php',
							pathname: '/wp-admin/site-editor.php',
							search: '',
							environment: 'wp-admin',
							currentScreen: { url: 'https://example.com/wp-admin/site-editor.php' },
							contextEntries: [
								{ id: 'site-structure', type: 'site-structure', data: { pages: 3 } },
							],
							constructorArguments: { client: 'site-editor' },
						} ),
					},
				},
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/admin.php?page=wc-admin',
							pathname: '/wp-admin/admin.php?page=wc-admin',
							search: '?page=wc-admin',
							environment: 'woocommerce-ai',
							page: { type: 'dashboard' },
							store: { currency: 'USD' },
							contextEntries: [
								{ id: 'woocommerce-ai', type: 'woocommerce-ai', data: { enabled: true } },
							],
							constructorArguments: { model: 'gpt-5.2', client: 'woocommerce-ai' },
						} ),
					},
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.contextProvider?.getClientContext() ).toEqual( {
			url: 'https://example.com/wp-admin/site-editor.php',
			pathname: '/wp-admin/site-editor.php',
			search: '',
			environment: 'wp-admin',
			currentScreen: { url: 'https://example.com/wp-admin/site-editor.php' },
			page: { type: 'dashboard' },
			store: { currency: 'USD' },
			contextEntries: [
				{ id: 'site-structure', type: 'site-structure', data: { pages: 3 } },
				{ id: 'woocommerce-ai', type: 'woocommerce-ai', data: { enabled: true } },
			],
			constructorArguments: {
				client: 'site-editor',
				model: 'gpt-5.2',
			},
		} );
	} );

	it( 'skips failed context providers when merging context from multiple providers', async () => {
		const consoleWarn = jest.spyOn( console, 'warn' ).mockImplementation();
		setAgentsManagerData( {
			agentProviders: [
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/site-editor.php',
							pathname: '/wp-admin/site-editor.php',
							search: '',
							environment: 'wp-admin',
							currentScreen: { url: 'https://example.com/wp-admin/site-editor.php' },
						} ),
					},
				},
				{
					contextProvider: {
						getClientContext: () => {
							throw new Error( 'Provider is not ready on this surface.' );
						},
					},
				},
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/admin.php?page=wc-admin',
							pathname: '/wp-admin/admin.php?page=wc-admin',
							search: '?page=wc-admin',
							environment: 'woocommerce-ai',
							store: { currency: 'USD' },
						} ),
					},
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.contextProvider?.getClientContext() ).toEqual( {
			url: 'https://example.com/wp-admin/site-editor.php',
			pathname: '/wp-admin/site-editor.php',
			search: '',
			environment: 'wp-admin',
			currentScreen: { url: 'https://example.com/wp-admin/site-editor.php' },
			store: { currency: 'USD' },
		} );
		expect( consoleWarn ).toHaveBeenCalledWith(
			'[AgentsManager] Failed to load context from provider:',
			expect.any( Error )
		);
		consoleWarn.mockRestore();
	} );

	it( 'returns a minimal browser context when every merged context provider fails', async () => {
		const consoleWarn = jest.spyOn( console, 'warn' ).mockImplementation();
		setAgentsManagerData( {
			agentProviders: [
				{
					contextProvider: {
						getClientContext: () => {
							throw new Error( 'First provider failed.' );
						},
					},
				},
				{
					contextProvider: {
						getClientContext: () => {
							throw new Error( 'Second provider failed.' );
						},
					},
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.contextProvider?.getClientContext() ).toEqual( {
			url: window.location.href,
			pathname: window.location.pathname,
			search: window.location.search,
			environment: 'wp-admin',
		} );
		expect( consoleWarn ).toHaveBeenCalledTimes( 2 );
		consoleWarn.mockRestore();
	} );

	it( 'merges markdown components and extensions from multiple providers', async () => {
		const hostStrong = jest.fn( () => ( { type: 'strong', props: { provider: 'host' } } ) );
		const wooTable = jest.fn( () => ( { type: 'table', props: { provider: 'woo' } } ) );
		setAgentsManagerData( {
			agentProviders: [
				{
					markdownComponents: { strong: hostStrong },
					markdownExtensions: { gfm: { enabled: true } },
				},
				{
					markdownComponents: { table: wooTable },
					markdownExtensions: { charts: { enabled: true } },
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.markdownComponents?.strong ).toBe( hostStrong );
		expect( providers.markdownComponents?.table ).toBe( wooTable );
		expect( providers.markdownExtensions ).toEqual( {
			gfm: { enabled: true },
			charts: { enabled: true },
		} );
	} );

	it( 'chains markdown code renderers so later providers can handle structured blocks', async () => {
		const hostCode = jest.fn( ( props ) => ( {
			type: 'code',
			props: { ...props, provider: 'host-fallback' },
		} ) );
		const wooCode = jest.fn( ( props: { className?: string } ) =>
			props.className === 'language-product'
				? { type: 'ProductCard', props: { provider: 'woo' } }
				: { type: 'code', props: { ...props, provider: 'woo-fallback' } }
		);
		setAgentsManagerData( {
			agentProviders: [
				{ markdownComponents: { code: hostCode } },
				{ markdownComponents: { code: wooCode } },
			],
		} );

		const providers = await loadExternalProviders();
		const CodeComponent = providers.markdownComponents?.code as ( props: {
			className?: string;
			children?: string;
		} ) => unknown;

		expect( CodeComponent( { className: 'language-product', children: '{"id":1}' } ) ).toEqual( {
			type: 'ProductCard',
			props: { provider: 'woo' },
		} );
		expect( hostCode ).toHaveBeenCalled();
		expect( wooCode ).toHaveBeenCalled();
	} );

	it( 'resolves abilities registered after load time (queried live, not snapshotted)', async () => {
		// Big Sky registers its editor abilities (e.g. big-sky/apply-block-edits)
		// from a React effect that runs after the chat UI mounts, which is after
		// loadExternalProviders() has run. The merged tool provider must query
		// each provider's abilities live so those late registrations are visible,
		// matching the single-provider path and agenttic-client's "callbacks are
		// called fresh each time" contract. A list snapshotted at load time would
		// never see them, so the agent's calls to those abilities would silently
		// never dispatch.
		const createAbility = ( name: string ) => ( {
			name,
			label: name,
			description: `${ name } description`,
			category: 'test',
		} );
		let editorAbilityRegistered = false;
		const bigSkyProvider = {
			getAbilities: jest.fn( () =>
				Promise.resolve(
					editorAbilityRegistered ? [ createAbility( 'big-sky/apply-block-edits' ) ] : []
				)
			),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'big-sky' } ) ),
		};
		const otherProvider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'wpcom/manage-site' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'wpcom' } ) ),
		};
		const agentsManagerData = {
			agentProviders: [ { toolProvider: bigSkyProvider }, { toolProvider: otherProvider } ],
		};
		( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;
		( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData =
			agentsManagerData;

		// loadExternalProviders() queries getAbilities() here, before the editor
		// ability is registered.
		const providers = await loadExternalProviders();

		// The editor ability registers later, once the chat UI has mounted.
		editorAbilityRegistered = true;

		await expect( providers.toolProvider?.getAbilities() ).resolves.toEqual( [
			createAbility( 'big-sky/apply-block-edits' ),
			createAbility( 'wpcom/manage-site' ),
		] );
		await expect(
			providers.toolProvider?.executeAbility( 'big_sky__apply_block_edits', { updates: [] } )
		).resolves.toEqual( { handledBy: 'big-sky' } );
		expect( bigSkyProvider.executeAbility ).toHaveBeenCalledWith( 'big_sky__apply_block_edits', {
			updates: [],
		} );
		expect( otherProvider.executeAbility ).not.toHaveBeenCalled();
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
