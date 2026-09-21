/**
 * @jest-environment jsdom
 */
import { amToolProvider } from '../../abilities';
import { applyBlockEditsAbility } from '../../abilities/apply-block-edits';
import { applyUpdateThemeAbility } from '../../abilities/apply-update-theme';
import { captureCanvasAbility } from '../../abilities/capture-canvas';
import { editEntityRecordAbility } from '../../abilities/edit-entity-record';
import { editorNavigateAbility } from '../../abilities/editor-navigate';
import { getBlockTreeAbility } from '../../abilities/get-block-tree';
import { restoreCheckpointAbility } from '../../abilities/restore-checkpoint';
import { setSiteLogoAbility } from '../../abilities/set-site-logo';
import { showComponentAbility } from '../../abilities/show-component';
import { showTemplateAbility } from '../../abilities/show-template';
import { streamPageDesignAbility } from '../../abilities/stream-page-design';
import { setStreamHandler } from '../../abilities/stream-page-design/stream';
import { wpAdminNavigateAbility } from '../../abilities/wp-admin-navigate';
import * as canvasBinding from '../canvas-binding';
import { getAvailableCheckpoints } from '../checkpoints';
import {
	loadExternalProviders,
	mergeCapabilitiesInto,
	mergeUseSuggestionsHooks,
} from '../load-external-providers';
import { getLoadedProviderIds, setLoadedProviderIds } from '../loaded-provider-ids';
import { getPageContentMarkup } from '../page-content-markup';
import { getPageStructure } from '../page-structure';
import {
	getProviderCheckpointObservedAt,
	getProviderCheckpointRecords,
} from '../provider-checkpoints';
import type { Ability } from '../../extension-types';
import type {
	ProviderCapabilities,
	UseCheckpointReturn,
	UseSuggestionsHook,
} from '../load-external-providers';
import type { UIMessage } from '@automattic/agenttic-client';

jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: jest.fn() } ), {
	virtual: true,
} );
jest.mock( '../canvas-binding', () => ( {
	...jest.requireActual( '../canvas-binding' ),
	bindToOpenCanvas: jest.fn(),
	getBlockingMove: jest.fn( () => null ),
} ) );
jest.mock( '../provider-checkpoints', () => ( {
	...jest.requireActual( '../provider-checkpoints' ),
	getProviderCheckpointRecords: jest.fn( () => [] ),
} ) );
jest.mock( '../page-content-markup', () => ( { getPageContentMarkup: jest.fn( () => '' ) } ) );
jest.mock( '../page-structure', () => ( { getPageStructure: jest.fn( () => null ) } ) );
jest.mock( '../checkpoints', () => ( {
	RESTORE_CHECKPOINT_TOOL_ID: 'big_sky__restore_checkpoint',
	checkpointKeys: { COLOR: 'color', FONT: 'font', BUTTON: 'button' },
	canSwapCheckpoint: jest.fn(),
	clearCheckpoint: jest.fn(),
	getAvailableCheckpoints: jest.fn( () => [] ),
	getCheckpoints: jest.fn( () => [] ),
	hasCheckpoint: jest.fn(),
	restoreCheckpoint: jest.fn(),
	setCheckpoint: jest.fn(),
	swapCheckpoint: jest.fn(),
} ) );

// The abilities facade only loads the editor abilities on editor pages —
// open the gate and resolve the load, so the merged provider and the sync
// checkpoint context see AM's abilities.
beforeAll( async () => {
	document.body.classList.add( 'site-editor-php' );
	await amToolProvider.getAbilities();
} );

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

/**
 * An ability list compared without pinning callback identity.
 *
 * The canvas guard wraps the callback of every ability it polices, which is
 * orthogonal to what these tests are about — merging, dedupe, ordering and
 * resilience. Everything else still compares deeply.
 * @param abilities The abilities to normalize.
 * @returns The abilities without their callbacks.
 */
function abilityShapes( abilities: Ability[] = [] ) {
	return abilities.map( ( { callback, ...rest } ) => rest );
}

function createCheckpointReturn(
	overrides: Partial< UseCheckpointReturn > = {}
): UseCheckpointReturn {
	return {
		getLastEditorState: jest.fn( () => null ),
		setCheckpoint: jest.fn(),
		addCheckpointKeys: jest.fn(),
		restoreCheckpoint: jest.fn( () => Promise.resolve() ),
		addNewPageToCheckpoint: jest.fn(),
		addPageRenameToCheckpoint: jest.fn(),
		addPageRemovalToCheckpoint: jest.fn(),
		getLatestUserMessageId: jest.fn( () => undefined ),
		clearCheckpoint: jest.fn(),
		hasCheckpoint: jest.fn( () => false ),
		...overrides,
	};
}

describe( 'mergeCapabilitiesInto', () => {
	it.each( [ undefined, null, 'oops', 42 ] )(
		'is a no-op for non-object capabilities: %p',
		( capabilities ) => {
			const merged: ProviderCapabilities = {};
			mergeCapabilitiesInto( merged, capabilities );
			expect( merged ).toEqual( {} );
		}
	);

	it.each( [ 'supportsSplitScreen', 'supportsRegenerateAction' ] as const )(
		'sets %s when the provider declares it',
		( flag ) => {
			const merged: ProviderCapabilities = {};
			mergeCapabilitiesInto( merged, { [ flag ]: true } );
			expect( merged[ flag ] ).toBe( true );
		}
	);

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
		mergeCapabilitiesInto( merged, { supportsRegenerateAction: 'true' } );
		mergeCapabilitiesInto( merged, { supportsSplitScreen: 1 } );
		expect( merged.supportsSplitScreen ).toBeUndefined();
		expect( merged.supportsRegenerateAction ).toBeUndefined();
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
			{
				get: ( _target, prop ) =>
					prop === 'supportsSplitScreen' || prop === 'supportsRegenerateAction' ? true : undefined,
			}
		);
		const merged: ProviderCapabilities = {};
		mergeCapabilitiesInto( merged, lazyCapabilities );
		expect( merged.supportsSplitScreen ).toBe( true );
		expect( merged.supportsRegenerateAction ).toBe( true );
	} );
} );

describe( 'loadExternalProviders', () => {
	afterEach( () => {
		window.history.replaceState( {}, '', '/' );
		delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData;
		delete ( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData;
		setLoadedProviderIds( undefined );
		jest.clearAllMocks();
		jest.requireMock( '../checkpoints' ).hasCheckpoint.mockReset();
		jest.requireMock( '../checkpoints' ).canSwapCheckpoint.mockReset();
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

	// With nothing configured, even `amToolProvider` stays absent — picker
	// surfaces always register at least one external provider.
	it.each( [
		[ 'not an array', 'not-an-array' ],
		[ 'an empty array', [] ],
	] )( 'resolves to no providers when agentProviders is %s', async ( _case, agentProviders ) => {
		setAgentsManagerData( { agentProviders } );

		await expect( loadExternalProviders() ).resolves.toEqual( {} );
		expect( getLoadedProviderIds() ).toEqual( [] );
	} );

	it( 'publishes the loaded provider ids for the Tracks wrappers', async () => {
		setAgentsManagerData( {
			agentProviders: [ { providerId: 'jetpack-ai' }, { providerId: 'woocommerce-ai' } ],
		} );

		await loadExternalProviders();

		expect( getLoadedProviderIds() ).toEqual( [ 'jetpack-ai', 'woocommerce-ai' ] );
	} );

	it( 'publishes an empty provider list for Reader Chat', async () => {
		setAgentsManagerData( {
			agentId: 'reader-chat',
			agentProviders: [ { providerId: 'jetpack-ai' } ],
		} );

		await loadExternalProviders();

		expect( getLoadedProviderIds() ).toEqual( [] );
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

		expect( abilityShapes( await providers.toolProvider?.getAbilities() ) ).toEqual(
			abilityShapes( [
				wpAdminNavigateAbility,
				applyBlockEditsAbility,
				applyUpdateThemeAbility,
				captureCanvasAbility,
				editEntityRecordAbility,
				editorNavigateAbility,
				restoreCheckpointAbility,
				setSiteLogoAbility,
				showComponentAbility,
				streamPageDesignAbility,
				getBlockTreeAbility,
				showTemplateAbility,
				createAbility( 'host/navigate' ),
				createAbility( 'woocommerce/get-products' ),
			] )
		);
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

		expect( abilityShapes( await providers.toolProvider?.getAbilities() ) ).toEqual(
			abilityShapes( [
				wpAdminNavigateAbility,
				applyBlockEditsAbility,
				applyUpdateThemeAbility,
				captureCanvasAbility,
				editEntityRecordAbility,
				editorNavigateAbility,
				restoreCheckpointAbility,
				setSiteLogoAbility,
				showComponentAbility,
				streamPageDesignAbility,
				getBlockTreeAbility,
				showTemplateAbility,
				createAbility( 'shared/action' ),
			] )
		);
		await expect( providers.toolProvider?.executeAbility( 'shared/action', {} ) ).resolves.toEqual(
			{
				handledBy: 'first',
			}
		);
		expect( firstProvider.executeAbility ).toHaveBeenCalled();
		expect( secondProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'stamps provider checkpoints at execution time', async () => {
		const provider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'host/edit-thing' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { ok: true } ) ),
		};
		setAgentsManagerData( { agentProviders: [ { toolProvider: provider } ] } );
		jest.mocked( getProviderCheckpointRecords ).mockReturnValueOnce( [ { id: 'toolu_mid_turn' } ] );

		const providers = await loadExternalProviders();
		await providers.toolProvider?.executeAbility( 'host/edit-thing', {} );

		expect( getProviderCheckpointObservedAt( 'toolu_mid_turn' ) ).toBeGreaterThan( 0 );
	} );

	it( 'executes migrated abilities through AM before any provider copy', async () => {
		const bigSkyProvider = {
			getAbilities: jest.fn( () =>
				Promise.resolve( [ createAbility( 'big-sky/show-component' ) ] )
			),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'big-sky' } ) ),
		};
		setAgentsManagerData( { agentProviders: [ { toolProvider: bigSkyProvider } ] } );

		const providers = await loadExternalProviders();
		const result = ( await providers.toolProvider?.executeAbility( 'big_sky__show_component', {
			type: 'color-picker',
			props: { variations: [] },
		} ) ) as { result?: { success?: boolean } };

		expect( result?.result?.success ).toBe( true );
		expect( bigSkyProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'flips execution to the provider copy with `?am_abilities=0`', async () => {
		window.history.replaceState( {}, '', '/?am_abilities=0' );
		const bigSkyProvider = {
			getAbilities: jest.fn( () =>
				Promise.resolve( [ createAbility( 'big-sky/show-component' ) ] )
			),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'big-sky' } ) ),
		};
		const onTaskUpdate = jest.fn();
		const useCheckpoint = jest.fn();
		setAgentsManagerData( {
			agentProviders: [
				{
					toolProvider: bigSkyProvider,
					contextProvider: { getClientContext: () => ( {} ) },
					onTaskUpdate,
					useCheckpoint,
				},
			],
		} );

		// The switch is read once per page load, so load the providers under it.
		await jest.isolateModulesAsync( async () => {
			const { loadExternalProviders: loadUnderSwitch } = jest.requireActual<
				typeof import( '../load-external-providers' )
			>( '../load-external-providers' );

			const providers = await loadUnderSwitch();

			// Migrated editor abilities flip to the provider copy; abilities with
			// no provider copy stay AM's.
			expect( abilityShapes( await providers.toolProvider?.getAbilities() ) ).toEqual(
				abilityShapes( [
					wpAdminNavigateAbility,
					getBlockTreeAbility,
					showTemplateAbility,
					createAbility( 'big-sky/show-component' ),
				] )
			);
			await expect(
				providers.toolProvider?.executeAbility( 'big_sky__show_component', {} )
			).resolves.toEqual( { handledBy: 'big-sky' } );
			expect( bigSkyProvider.executeAbility ).toHaveBeenCalled();

			// The page-design stream, the chat's Undo and the page context are the
			// provider copy's too.
			expect( providers.onTaskUpdate ).toBe( onTaskUpdate );
			expect( providers.useCheckpoint ).toBe( useCheckpoint );

			// The mocks are shared with every other test, whose reads must not count.
			jest.mocked( getPageContentMarkup ).mockClear();
			jest.mocked( getPageStructure ).mockClear();
			providers.contextProvider?.getClientContext();

			expect( getPageContentMarkup ).not.toHaveBeenCalled();
			expect( getPageStructure ).not.toHaveBeenCalled();
		} );
	} );

	it( 'keeps the remaining abilities when a provider fails to list its own', async () => {
		const consoleWarn = jest.spyOn( console, 'warn' ).mockImplementation();
		const failingProvider = {
			getAbilities: jest.fn( () => Promise.reject( new Error( 'Provider is not ready.' ) ) ),
			executeAbility: jest.fn(),
		};
		const workingProvider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'host/navigate' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'host' } ) ),
		};
		setAgentsManagerData( {
			agentProviders: [ { toolProvider: failingProvider }, { toolProvider: workingProvider } ],
		} );

		const providers = await loadExternalProviders();

		expect( abilityShapes( await providers.toolProvider?.getAbilities() ) ).toEqual(
			abilityShapes( [
				wpAdminNavigateAbility,
				applyBlockEditsAbility,
				applyUpdateThemeAbility,
				captureCanvasAbility,
				editEntityRecordAbility,
				editorNavigateAbility,
				restoreCheckpointAbility,
				setSiteLogoAbility,
				showComponentAbility,
				streamPageDesignAbility,
				getBlockTreeAbility,
				showTemplateAbility,
				createAbility( 'host/navigate' ),
			] )
		);
		expect( consoleWarn ).toHaveBeenCalledWith(
			'[AgentsManager] Failed to load abilities from provider:',
			expect.any( Error )
		);
		consoleWarn.mockRestore();
	} );

	it( 'rejects execution when no provider handles the ability', async () => {
		const provider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'host/navigate' ) ] ) ),
			executeAbility: jest.fn(),
		};
		setAgentsManagerData( { agentProviders: [ { toolProvider: provider } ] } );

		const providers = await loadExternalProviders();

		await expect(
			providers.toolProvider?.executeAbility( 'unknown__ability', {} )
		).rejects.toThrow( 'No provider handled ability: unknown__ability' );
		expect( provider.executeAbility ).not.toHaveBeenCalled();
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

	it( 'lists AM checkpoints created after the provider ones last', async () => {
		const amCreatedAt = Date.now() + 60_000;
		jest.mocked( getAvailableCheckpoints ).mockReturnValueOnce( [
			{
				checkpointId: 'toolu_am',
				checkpointIndex: 0,
				checkpointKeys: [ 'color' ],
				createdAt: amCreatedAt,
			},
		] );
		setAgentsManagerData( {
			agentProviders: [
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/site-editor.php',
							pathname: '/wp-admin/site-editor.php',
							search: '',
							environment: 'wp-admin',
							availableCheckpoints: [
								{ checkpointId: 'toolu_bsp', checkpointIndex: 0, checkpointKeys: [ 'blocks' ] },
							],
						} ),
					},
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.contextProvider?.getClientContext().availableCheckpoints ).toEqual( [
			{ checkpointId: 'toolu_bsp', checkpointIndex: 0, checkpointKeys: [ 'blocks' ] },
			{
				checkpointId: 'toolu_am',
				checkpointIndex: 1,
				checkpointKeys: [ 'color' ],
				createdAt: amCreatedAt,
			},
		] );
	} );

	it( 'lists AM checkpoints created before a provider record appeared first', async () => {
		const amCreatedAt = Date.now() - 60_000;
		jest.mocked( getAvailableCheckpoints ).mockReturnValueOnce( [
			{
				checkpointId: 'toolu_am_early',
				checkpointIndex: 0,
				checkpointKeys: [ 'color' ],
				createdAt: amCreatedAt,
			},
		] );
		setAgentsManagerData( {
			agentProviders: [
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/site-editor.php',
							pathname: '/wp-admin/site-editor.php',
							search: '',
							environment: 'wp-admin',
							availableCheckpoints: [
								{
									checkpointId: 'toolu_bsp_late',
									checkpointIndex: 0,
									checkpointKeys: [ 'blocks' ],
								},
							],
						} ),
					},
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect(
			providers.contextProvider
				?.getClientContext()
				.availableCheckpoints?.map(
					( item: { checkpointId?: string; checkpointIndex?: number } ) => [
						item.checkpointId,
						item.checkpointIndex,
					]
				)
		).toEqual( [
			[ 'toolu_am_early', 0 ],
			[ 'toolu_bsp_late', 1 ],
		] );
	} );

	it( 'leaves the provider checkpoint list untouched when AM has none', async () => {
		const providerCheckpoints = [
			{ checkpointId: 'toolu_bsp', checkpointIndex: 0, checkpointKeys: [ 'blocks' ] },
		];
		setAgentsManagerData( {
			agentProviders: [
				{
					contextProvider: {
						getClientContext: () => ( {
							url: 'https://example.com/wp-admin/site-editor.php',
							pathname: '/wp-admin/site-editor.php',
							search: '',
							environment: 'wp-admin',
							availableCheckpoints: providerCheckpoints,
						} ),
					},
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.contextProvider?.getClientContext().availableCheckpoints ).toEqual(
			providerCheckpoints
		);
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

	it( 'resolves chat components through providers until one matches', async () => {
		const TitlePicker = () => null;
		const hostComponents = jest.fn( () => null );
		const wooComponents = jest.fn( ( type: string ) =>
			type === 'title-picker' ? TitlePicker : null
		);
		setAgentsManagerData( {
			agentProviders: [ { getChatComponent: hostComponents }, { getChatComponent: wooComponents } ],
		} );

		const providers = await loadExternalProviders();

		expect( providers.getChatComponent?.( 'title-picker' ) ).toBe( TitlePicker );
		expect( providers.getChatComponent?.( 'chat-suggestions' ) ).toBeNull();
	} );

	it( 'chains message transforms across providers', async () => {
		// Chained, not first-write-wins: one provider hiding its own prompts must
		// not stop another from presenting its messages.
		setAgentsManagerData( {
			agentProviders: [
				{
					transformMessages: ( messages: UIMessage[] ) =>
						messages.map( ( message ) => ( { ...message, id: `${ message.id }-a` } ) ),
				},
				{
					transformMessages: ( messages: UIMessage[] ) =>
						messages.map( ( message ) => ( { ...message, id: `${ message.id }-b` } ) ),
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.transformMessages?.( [ { id: '1' } as UIMessage ] ) ).toEqual( [
			{ id: '1-a-b' },
		] );
	} );

	it( 'leaves the transcript alone when no provider transforms messages', async () => {
		setAgentsManagerData( { agentProviders: [ {} ] } );

		const providers = await loadExternalProviders();

		expect( providers.transformMessages ).toBeUndefined();
	} );

	it( 'forwards task updates to the first provider only', async () => {
		const first = jest.fn();
		const second = jest.fn();
		setAgentsManagerData( {
			agentProviders: [ { onTaskUpdate: first }, { onTaskUpdate: second } ],
		} );
		const update = { status: { message: { parts: [ { type: 'text' } ] } } };

		const providers = await loadExternalProviders();
		await providers.onTaskUpdate?.( update );

		expect( first ).toHaveBeenCalledWith( update );
		expect( second ).not.toHaveBeenCalled();
	} );

	describe( 'page-design stream', () => {
		const text = { type: 'text', text: 'Designing…' };
		const stream = {
			type: 'data',
			data: {
				toolId: 'big_sky__stream_page_design',
				toolCallId: 'call-1',
				arguments: { markup: '<!-- wp:paragraph /-->' },
			},
		};
		const update = { status: { message: { parts: [ text, stream ] } } };
		let renderer: jest.Mock;

		beforeEach( () => {
			renderer = jest.fn();
			setStreamHandler( renderer );
		} );

		afterEach( () => {
			setStreamHandler( undefined );
			// The off-editor test closes the gate the suite opened.
			document.body.classList.add( 'site-editor-php' );
		} );

		// AM paints the page design itself; a provider's own copy must not see the frames.
		it( 'feeds the frames to the renderer and keeps them from the providers', async () => {
			const onTaskUpdate = jest.fn();
			setAgentsManagerData( { agentProviders: [ { onTaskUpdate } ] } );

			const providers = await loadExternalProviders();
			await providers.onTaskUpdate?.( update );

			expect( renderer ).toHaveBeenCalledWith( { toolCallId: 'call-1' } );
			expect( onTaskUpdate ).toHaveBeenCalledWith( { status: { message: { parts: [ text ] } } } );
		} );

		// Off the editor pages nothing of AM's paints, so the provider copy keeps its frames.
		it( 'leaves the frames to the providers off the editor pages', async () => {
			const onTaskUpdate = jest.fn();
			setAgentsManagerData( { agentProviders: [ { onTaskUpdate } ] } );
			document.body.classList.remove( 'site-editor-php' );

			const providers = await loadExternalProviders();
			await providers.onTaskUpdate?.( update );

			expect( renderer ).not.toHaveBeenCalled();
			expect( onTaskUpdate ).toHaveBeenCalledWith( update );
		} );
	} );

	describe( 'page context', () => {
		const providerContext = { url: 'https://x' };
		const pageStructure = {
			currentPageContent: [ { clientId: 'abcd', name: 'core/paragraph', innerBlocks: [] } ],
			selectedBlockClientId: 'abcd',
		};
		const providerStructure = {
			currentPageContent: [ { clientId: 'uuid' } ],
			selectedBlockClientId: 'uuid',
		};

		// Not a once-value: the sidebar case never reads it, and it would leak.
		afterEach( () => jest.mocked( getPageStructure ).mockReturnValue( null ) );

		it( 'adds the page body the editor holds to the client context', async () => {
			jest.mocked( getPageContentMarkup ).mockReturnValueOnce( '<!-- wp:paragraph /-->' );
			setAgentsManagerData( {
				agentProviders: [ { contextProvider: { getClientContext: () => providerContext } } ],
			} );

			const providers = await loadExternalProviders();

			expect( providers.contextProvider?.getClientContext() ).toEqual( {
				...providerContext,
				currentPageContentMarkup: '<!-- wp:paragraph /-->',
			} );
		} );

		it( 'adds nothing where the view has no page body', async () => {
			setAgentsManagerData( {
				agentProviders: [ { contextProvider: { getClientContext: () => providerContext } } ],
			} );

			const providers = await loadExternalProviders();

			expect( providers.contextProvider?.getClientContext() ).toEqual( providerContext );
		} );

		// The ids the agent sends back have to be the ones AM's abilities resolve.
		it.each( [
			{
				case: "sends its own structure, over a provider's",
				environment: 'wp-admin',
				expected: pageStructure,
			},
			{
				case: "leaves the Jetpack AI sidebar's structure, whose tools take clientIds as they are",
				environment: 'gutenberg',
				expected: providerStructure,
			},
		] )( '$case', async ( { environment, expected } ) => {
			jest.mocked( getPageStructure ).mockReturnValue( pageStructure );
			const context = { ...providerContext, environment, ...providerStructure };
			setAgentsManagerData( {
				agentProviders: [ { contextProvider: { getClientContext: () => context } } ],
			} );

			const providers = await loadExternalProviders();

			expect( providers.contextProvider?.getClientContext() ).toEqual( {
				...context,
				...expected,
			} );
		} );
	} );

	it( 'merges empty view suggestions from multiple providers and dedupes by id', async () => {
		setAgentsManagerData( {
			agentProviders: [
				{
					getEmptyViewSuggestions: () => [
						{ id: 'shared', label: 'First shared', prompt: 'First shared prompt.' },
						{ id: 'first-only', label: 'First only', prompt: 'First only prompt.' },
					],
				},
				{
					getEmptyViewSuggestions: () => [
						{ id: 'shared', label: 'Second shared', prompt: 'Second shared prompt.' },
						{ id: 'second-only', label: 'Second only', prompt: 'Second only prompt.' },
					],
				},
			],
		} );

		const providers = await loadExternalProviders();

		expect( providers.getEmptyViewSuggestions?.() ).toEqual( [
			{ id: 'shared', label: 'First shared', prompt: 'First shared prompt.' },
			{ id: 'first-only', label: 'First only', prompt: 'First only prompt.' },
			{ id: 'second-only', label: 'Second only', prompt: 'Second only prompt.' },
		] );
	} );

	it( 'resolves abilities registered after load time (queried live, not snapshotted)', async () => {
		// A provider may register its abilities from a React effect that runs
		// after `loadExternalProviders()` — the merged provider must query each
		// provider live, or those late registrations would never dispatch.
		let editorAbilityRegistered = false;
		const bigSkyProvider = {
			getAbilities: jest.fn( () =>
				Promise.resolve(
					editorAbilityRegistered ? [ createAbility( 'big-sky/compose-patterns' ) ] : []
				)
			),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'big-sky' } ) ),
		};
		const otherProvider = {
			getAbilities: jest.fn( () => Promise.resolve( [ createAbility( 'wpcom/manage-site' ) ] ) ),
			executeAbility: jest.fn( () => Promise.resolve( { handledBy: 'wpcom' } ) ),
		};
		setAgentsManagerData( {
			agentProviders: [ { toolProvider: bigSkyProvider }, { toolProvider: otherProvider } ],
		} );

		const providers = await loadExternalProviders();
		editorAbilityRegistered = true;

		expect( abilityShapes( await providers.toolProvider?.getAbilities() ) ).toEqual(
			abilityShapes( [
				wpAdminNavigateAbility,
				applyBlockEditsAbility,
				applyUpdateThemeAbility,
				captureCanvasAbility,
				editEntityRecordAbility,
				editorNavigateAbility,
				restoreCheckpointAbility,
				setSiteLogoAbility,
				showComponentAbility,
				streamPageDesignAbility,
				getBlockTreeAbility,
				showTemplateAbility,
				createAbility( 'big-sky/compose-patterns' ),
				createAbility( 'wpcom/manage-site' ),
			] )
		);
		await expect(
			providers.toolProvider?.executeAbility( 'big_sky__compose_patterns', { updates: [] } )
		).resolves.toEqual( { handledBy: 'big-sky' } );
		expect( bigSkyProvider.executeAbility ).toHaveBeenCalledWith( 'big_sky__compose_patterns', {
			updates: [],
		} );
		expect( otherProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'composes checkpoint hooks so id lookups search every provider store', async () => {
		const firstReturn = createCheckpointReturn( {
			getLastEditorState: jest.fn( () => 'first-editor-state' ),
			hasCheckpoint: jest.fn( ( id: string ) => id === 'first-cp' ),
		} );
		const secondReturn = createCheckpointReturn( {
			hasCheckpoint: jest.fn( ( id: string ) => id === 'second-cp' ),
			canSwapCheckpoint: jest.fn( ( id: string ) => id === 'second-cp' ),
			swapCheckpoint: jest.fn( () => Promise.resolve() ),
		} );
		const firstHook = jest.fn( () => firstReturn );
		const secondHook = jest.fn( () => secondReturn );
		setAgentsManagerData( {
			agentProviders: [ { useCheckpoint: firstHook }, { useCheckpoint: secondHook } ],
		} );

		const providers = await loadExternalProviders();
		const checkpoint = providers.useCheckpoint?.();

		expect( firstHook ).toHaveBeenCalled();
		expect( secondHook ).toHaveBeenCalled();
		expect( checkpoint?.hasCheckpoint( 'second-cp' ) ).toBe( true );
		await checkpoint?.restoreCheckpoint( 'second-cp' );
		expect( secondReturn.restoreCheckpoint ).toHaveBeenCalledWith( 'second-cp' );
		expect( firstReturn.restoreCheckpoint ).not.toHaveBeenCalled();
		expect( checkpoint?.canSwapCheckpoint?.( 'second-cp' ) ).toBe( true );
		await checkpoint?.swapCheckpoint?.( 'second-cp' );
		expect( secondReturn.swapCheckpoint ).toHaveBeenCalledWith( 'second-cp' );
		checkpoint?.clearCheckpoint( 'second-cp' );
		expect( secondReturn.clearCheckpoint ).toHaveBeenCalledWith( 'second-cp' );
		expect( firstReturn.clearCheckpoint ).not.toHaveBeenCalled();

		expect( checkpoint?.hasCheckpoint( 'missing-cp' ) ).toBe( false );
		await checkpoint?.restoreCheckpoint( 'missing-cp' );
		expect( firstReturn.restoreCheckpoint ).not.toHaveBeenCalled();
		expect( secondReturn.restoreCheckpoint ).toHaveBeenCalledTimes( 1 );

		expect( checkpoint?.getLastEditorState() ).toBe( 'first-editor-state' );
		checkpoint?.setCheckpoint( 'new-cp', [ 'title' ] );
		expect( firstReturn.setCheckpoint ).toHaveBeenCalledWith( 'new-cp', [ 'title' ] );
		expect( secondReturn.setCheckpoint ).not.toHaveBeenCalled();
	} );

	// The editor abilities write to AM's own store, which the chat's Undo has
	// to see; the provider's hook still answers for the ids it holds.
	const withBothStores = async () => {
		const amCheckpoints = jest.requireMock( '../checkpoints' );
		amCheckpoints.hasCheckpoint.mockImplementation( ( id: string ) => id === 'am-cp' );
		amCheckpoints.canSwapCheckpoint.mockReturnValue( true );
		const providerReturn = createCheckpointReturn( {
			hasCheckpoint: jest.fn( ( id: string ) => id === 'provider-cp' ),
			canSwapCheckpoint: jest.fn( () => false ),
		} );
		setAgentsManagerData( { agentProviders: [ { useCheckpoint: () => providerReturn } ] } );

		const checkpoint = ( await loadExternalProviders() ).useCheckpoint?.();

		return { amCheckpoints, providerReturn, checkpoint };
	};

	it( "routes an id AM holds to AM's store without asking the provider hook", async () => {
		const { amCheckpoints, providerReturn, checkpoint } = await withBothStores();

		expect( checkpoint?.hasCheckpoint( 'am-cp' ) ).toBe( true );
		await checkpoint?.restoreCheckpoint( 'am-cp' );
		expect( checkpoint?.canSwapCheckpoint?.( 'am-cp' ) ).toBe( true );
		await checkpoint?.swapCheckpoint?.( 'am-cp' );
		checkpoint?.clearCheckpoint( 'am-cp' );

		expect( amCheckpoints.restoreCheckpoint ).toHaveBeenCalledWith( 'am-cp' );
		expect( amCheckpoints.swapCheckpoint ).toHaveBeenCalledWith( 'am-cp' );
		expect( amCheckpoints.clearCheckpoint ).toHaveBeenCalledWith( 'am-cp' );
		expect( providerReturn.hasCheckpoint ).not.toHaveBeenCalled();
		expect( providerReturn.restoreCheckpoint ).not.toHaveBeenCalled();
		expect( providerReturn.canSwapCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'routes an id only the provider holds to its hook, which cannot swap it', async () => {
		const { amCheckpoints, providerReturn, checkpoint } = await withBothStores();

		expect( checkpoint?.hasCheckpoint( 'provider-cp' ) ).toBe( true );
		expect( checkpoint?.hasCheckpoint( 'missing-cp' ) ).toBe( false );

		await checkpoint?.restoreCheckpoint( 'provider-cp' );
		expect( checkpoint?.canSwapCheckpoint?.( 'provider-cp' ) ).toBe( false );
		await expect( checkpoint?.swapCheckpoint?.( 'provider-cp' ) ).rejects.toThrow(
			'does not support swapping'
		);

		expect( providerReturn.restoreCheckpoint ).toHaveBeenCalledWith( 'provider-cp' );
		expect( amCheckpoints.restoreCheckpoint ).not.toHaveBeenCalled();
		expect( checkpoint?.getLastEditorState() ).toBeNull();
	} );

	it( "serves AM's checkpoints with no provider hook at all", async () => {
		jest.requireMock( '../checkpoints' ).hasCheckpoint.mockReturnValue( true );
		setAgentsManagerData( { agentProviders: [ { getEmptyViewSuggestions: () => [] } ] } );

		const checkpoint = ( await loadExternalProviders() ).useCheckpoint?.();

		expect( checkpoint?.hasCheckpoint( 'am-cp' ) ).toBe( true );
		expect( checkpoint?.getLastEditorState ).toBeUndefined();
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

	it( 'forwards the suggestion limit to provider hooks', () => {
		const firstHook = jest.fn( () => ( { suggestions: [] } ) ) as UseSuggestionsHook;
		const secondHook = jest.fn( () => ( { suggestions: [] } ) ) as UseSuggestionsHook;
		const merged = mergeUseSuggestionsHooks( [ firstHook, secondHook ] );

		merged?.( 3 );

		expect( firstHook ).toHaveBeenCalledWith( 3 );
		expect( secondHook ).toHaveBeenCalledWith( 3 );
	} );

	it( 'uses only contextual suggestions when any provider replaces the empty view', () => {
		const firstHook = jest.fn( () => ( {
			suggestions: [ { id: 'first', label: 'First', prompt: 'First prompt.' } ],
		} ) ) as UseSuggestionsHook;
		const secondHook = jest.fn( () => ( {
			suggestions: [ { id: 'second', label: 'Second', prompt: 'Second prompt.' } ],
			replaceEmptyViewSuggestions: true,
		} ) ) as UseSuggestionsHook;
		const merged = mergeUseSuggestionsHooks( [ firstHook, secondHook ] );

		expect( merged?.() ).toEqual( {
			suggestions: [ { id: 'second', label: 'Second', prompt: 'Second prompt.' } ],
			replaceEmptyViewSuggestions: true,
		} );
	} );
} );

describe( 'canvas guard wiring', () => {
	// Drives the binding directly rather than through a mocked editor store: what
	// is under test here is that the wrappers are actually applied to the providers
	// `loadExternalProviders` hands back, not the state machine itself (covered in
	// `canvas-binding.test.ts`).
	const mockedBinding = jest.mocked( canvasBinding );

	beforeEach( () => {
		mockedBinding.getBlockingMove.mockReturnValue( null );
		mockedBinding.bindToOpenCanvas.mockClear();
	} );

	// Both provider counts, because the loader assigns the merged tool provider on
	// two separate paths and only one of them runs for a given surface. A guard
	// applied on the multi-provider path alone would be inert wherever a single
	// provider is registered — which is most editor surfaces.
	it.each( [ 1, 2 ] )( 'refuses a moved canvas write with %i tool provider(s)', async ( count ) => {
		mockedBinding.getBlockingMove.mockReturnValue( { from: 'About', to: 'Contact' } );
		const executeAbility = jest.fn();
		setAgentsManagerData( {
			agentProviders: Array.from( { length: count }, ( _unused, index ) => ( {
				toolProvider: {
					getAbilities: jest.fn( () =>
						Promise.resolve( [ createAbility( `big-sky/apply-block-edits-${ index }` ) ] )
					),
					executeAbility,
				},
			} ) ),
		} );

		const providers = await loadExternalProviders();
		const result = await providers.toolProvider?.executeAbility( 'big_sky__apply_block_edits', {} );

		expect( executeAbility ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( {
			returnToAgent: true,
			result: { success: false, error: 'editor_canvas_moved' },
		} );
	} );

	it( 'binds to the open canvas when the client context is built', async () => {
		const providerContext = {
			url: 'https://x',
			pathname: '/x',
			search: '',
			environment: 'wp-admin',
		};
		setAgentsManagerData( {
			agentProviders: [ { contextProvider: { getClientContext: () => providerContext } } ],
		} );

		const providers = await loadExternalProviders();
		const context = providers.contextProvider?.getClientContext();

		expect( mockedBinding.bindToOpenCanvas ).toHaveBeenCalled();
		// The binding adds nothing to the wire: it reads the canvas from the editor
		// store, so what the server receives is exactly what the provider built.
		expect( context ).toEqual( providerContext );
	} );
} );
