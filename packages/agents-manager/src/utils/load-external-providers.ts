// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// Ambient declaration files cannot be `import`ed; a triple-slash reference is required to ensure
// the global is visible when TypeScript resolves this file via the import graph rather than the
// tsconfig include list (e.g. during sandbox / CI builds).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />
/**
 * External Provider Loading Utility
 *
 * Loads external agent providers registered via the agents_manager_agent_providers
 * PHP filter. Each provider module should export toolProvider and/or contextProvider.
 */

import { getAgentManager, UIMessage } from '@automattic/agenttic-client';
import type { ToolProvider, ContextProvider, Suggestion, BigSkyMessage } from '../types';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';
import type {
	MarkdownComponents,
	MarkdownExtensions,
	UploadedImage,
	UploadingImage,
} from '@automattic/agenttic-ui';

/**
 * Check if the unified experience flag is set via agentsManagerData.
 *
 * This is used on wp-admin environments (Atomic, Garden, Simple sites) where
 * the flag is injected server-side by Jetpack's Agents Manager.
 * @returns The useUnifiedExperience value, or undefined if not available.
 */
export function getUseUnifiedExperienceFromInlineData(): boolean | undefined {
	if ( typeof agentsManagerData !== 'undefined' ) {
		return agentsManagerData?.useUnifiedExperience;
	}
	return undefined;
}

/**
 * Hook that resumes the conversation after a full page navigation
 * (e.g., `wp-admin/navigate`) by sending a tool result.
 */
export type NavigationContinuationHook = ( props: {
	isProcessing: boolean;
	sendToolResult: ( params: {
		toolCallId: string;
		toolId: string;
		message: string;
		sessionId: string;
	} ) => Promise< void >;
	sessionId: string;
	pathname: string;
} ) => void;

/**
 * Abilities setup hook type - for registering hook-based abilities that utilize React
 * context. Invoked after custom actions registration with Big Sky's AI store. Receives
 * action handlers that will be used for agent and chat interaction.
 */
export type AbilitiesSetupHook = ( actions: {
	addMessage: ( message: BigSkyMessage ) => void;
	clearMessages: () => void;
	clearSuggestions: UseAgentChatReturn[ 'clearSuggestions' ];
	getAgentManager: typeof getAgentManager;
	setIsThinking: ( isThinking: boolean ) => void;
	deleteMarkedMessages: ( messages: Record< 'id', string >[] ) => void;
	getSessionId: () => string | undefined;
	setIsBuildingSite: ( isBuildingSite: boolean ) => void;
	setThinkingMessage: ( message: string | null ) => void;
} ) => void;

/**
 * Suggestions hook type - for providing dynamic suggestions based on context
 * (e.g., selected block in editor). Returns an array of suggestions.
 */
export type UseSuggestionsHook = ( maxSuggestions?: number ) => {
	suggestions: Suggestion[];
};

export type SiteBuildUtils = {
	hasSiteBuildMessages: ( messages: UIMessage[] ) => boolean;
	groupSiteBuildMessages: ( messages: UIMessage[], thinkingMessage: string | null ) => UIMessage[];
};

/**
 * Supported chat component types for agent messages.
 */
type ChatComponentType =
	| 'button-picker'
	| 'font-picker'
	| 'color-picker'
	| 'pattern-picker'
	| 'chat-suggestions'
	| 'next-step-button';

/**
 * Get a chat component by type for rendering in agent messages.
 * @param type - The type of chat component to get
 * @returns The React component for the specified type, or `null` if unknown
 */
export type GetChatComponent = ( type: ChatComponentType ) => React.ComponentType< unknown > | null;

export type ImagePreview = {
	id: string;
	url: string;
	name: string;
	alt: string;
	mime_type: string;
	file: File;
};

export type MediaObject = {
	id: number;
	title: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	dimensions: {
		width: number;
		height: number;
	};
	uploadDate: string;
	uploadedBy: number;
	url: string;
	alt: string;
	caption: string;
};

export type UseImageUploadResult = {
	pendingImages: ImagePreview[];
	uploadingImages: UploadingImage[];
	isUploadingImages: boolean;
	handleFilesSelected: ( files: File[] ) => Promise< void >;
	handleRemoveImage: ( image: UploadedImage ) => void;
	uploadImagesToWordPress: () => Promise< MediaObject[] >;
};

export type ImageUploadHook = () => UseImageUploadResult;

/**
 * Checkpoint return type - for saving and restoring editor state so that AI actions can be undone.
 */
export type UseCheckpointReturn = {
	getLastEditorState: () => unknown;
	setCheckpoint: ( id: string, keys?: string[] ) => void;
	addCheckpointKeys: ( id: string, keys: string[] ) => void;
	restoreCheckpoint: ( id: string ) => Promise< void >;
	addNewPageToCheckpoint: ( pageId: string ) => void;
	addPageRenameToCheckpoint: ( pageId: string, oldTitle: string, newTitle: string ) => void;
	addPageRemovalToCheckpoint: (
		pageId: string,
		pageTitle: string,
		options?: { shouldRestoreNavigation?: boolean }
	) => void;
	getLatestUserMessageId: () => string | undefined;
	clearCheckpoint: ( userMessageId: string ) => void;
	hasCheckpoint: ( id: string ) => boolean;
};

/** Hook that returns checkpoint utilities for the current editor session. */
export type UseCheckpointHook = () => UseCheckpointReturn;

export interface LoadedProviders {
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	/** Function to get empty view suggestions. Called when component is ready. */
	getEmptyViewSuggestions?: () => Suggestion[];
	markdownComponents?: MarkdownComponents;
	markdownExtensions?: MarkdownExtensions;
	useNavigationContinuation?: NavigationContinuationHook;
	useAbilitiesSetup?: AbilitiesSetupHook;
	useSuggestions?: UseSuggestionsHook;
	getChatComponent?: GetChatComponent;
	siteBuildUtils?: SiteBuildUtils;
	useImageUpload?: ImageUploadHook;
	useCheckpoint?: UseCheckpointHook;
}

/**
 * Load external agent providers from agentsManagerData.agentProviders.
 *
 * Each provider module ID is dynamically imported using WordPress's script module
 * system. Modules should export { toolProvider, contextProvider }.
 * @returns Promise resolving to merged providers or empty object if none found.
 */
export async function loadExternalProviders(): Promise< LoadedProviders > {
	const agentProviders =
		typeof agentsManagerData !== 'undefined' ? agentsManagerData?.agentProviders || [] : [];

	if ( agentProviders.length === 0 ) {
		return {};
	}

	let mergedToolProvider: ToolProvider | undefined;
	let mergedContextProvider: ContextProvider | undefined;
	let mergedGetEmptyViewSuggestions: ( () => Suggestion[] ) | undefined;
	let mergedMarkdownComponents: MarkdownComponents | undefined;
	let mergedMarkdownExtensions: MarkdownExtensions | undefined;
	let mergedNavigationContinuation: NavigationContinuationHook | undefined;
	let mergedAbilitiesSetup: AbilitiesSetupHook | undefined;
	let mergedGetChatComponent: GetChatComponent | undefined;
	let mergedUseSuggestions: UseSuggestionsHook | undefined;
	let mergedSiteBuildUtils: SiteBuildUtils | undefined;
	let mergedImageUpload: ImageUploadHook | undefined;
	let mergedUseCheckpoint: UseCheckpointHook | undefined;

	// Collect exports that need to be merged across all providers.
	const allToolProviders: ToolProvider[] = [];
	const allGetChatComponents: GetChatComponent[] = [];
	const allAbilitiesSetups: AbilitiesSetupHook[] = [];
	const allUseSuggestions: UseSuggestionsHook[] = [];
	const allGetEmptyViewSuggestions: ( () => Suggestion[] )[] = [];

	for ( const moduleId of agentProviders ) {
		try {
			// Dynamic import of registered script module
			// The webpackIgnore comment tells webpack not to bundle this - it's loaded at runtime
			const module = await import( /* webpackIgnore: true */ moduleId );

			// These exports are merged across all providers.
			if ( module.toolProvider ) {
				allToolProviders.push( module.toolProvider );
			}
			if ( module.getChatComponent ) {
				allGetChatComponents.push( module.getChatComponent );
			}
			if ( module.useAbilitiesSetup ) {
				allAbilitiesSetups.push( module.useAbilitiesSetup );
			}
			if ( module.useSuggestions ) {
				allUseSuggestions.push( module.useSuggestions );
			}
			if ( module.getEmptyViewSuggestions ) {
				allGetEmptyViewSuggestions.push( module.getEmptyViewSuggestions );
			}

			// First-write-wins for singleton exports.
			if ( module.contextProvider && ! mergedContextProvider ) {
				mergedContextProvider = module.contextProvider;
			}
			if ( module.markdownComponents && ! mergedMarkdownComponents ) {
				mergedMarkdownComponents = module.markdownComponents;
			}
			if ( module.markdownExtensions && ! mergedMarkdownExtensions ) {
				mergedMarkdownExtensions = module.markdownExtensions;
			}
			if ( module.useNavigationContinuation && ! mergedNavigationContinuation ) {
				mergedNavigationContinuation = module.useNavigationContinuation;
			}
			if ( module.siteBuildUtils && ! mergedSiteBuildUtils ) {
				mergedSiteBuildUtils = module.siteBuildUtils;
			}
			if ( module.useImageUpload && ! mergedImageUpload ) {
				mergedImageUpload = module.useImageUpload;
			}
			if ( module.useCheckpoint && ! mergedUseCheckpoint ) {
				mergedUseCheckpoint = module.useCheckpoint;
			}

			// eslint-disable-next-line no-console
			console.log( `[AgentsManager] Loaded provider "${ moduleId }"` );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( `[AgentsManager] Failed to load provider "${ moduleId }":`, error );
		}
	}

	// Merge toolProviders: first-write-wins by ability name, matching the
	// resolution order of every other merged provider export (contextProvider,
	// getChatComponent, useSuggestions, etc). Providers are processed in the
	// order they were registered; earlier providers win on ability-name
	// collisions, and executeAbility tries earlier providers first.
	if ( allToolProviders.length === 1 ) {
		mergedToolProvider = allToolProviders[ 0 ];
	} else if ( allToolProviders.length > 1 ) {
		mergedToolProvider = {
			getAbilities: async () => {
				const results = await Promise.all( allToolProviders.map( ( tp ) => tp.getAbilities() ) );
				const seen = new Map< string, unknown >();
				for ( const abilities of results ) {
					for ( const ability of abilities ) {
						if ( ! seen.has( ability.name ) ) {
							seen.set( ability.name, ability );
						}
					}
				}
				return [ ...seen.values() ] as Awaited< ReturnType< ToolProvider[ 'getAbilities' ] > >;
			},
			executeAbility: async ( name: string, args: unknown ) => {
				// Identify the owning provider by walking `getAbilities` in the
				// same order as the dedupe above (first-write-wins), then
				// delegate to that single provider. This avoids the older
				// approach of iterating with `try/catch { /* try next */ }`,
				// which silently swallowed real errors from a provider that
				// DID own the ability but genuinely failed.
				for ( const provider of allToolProviders ) {
					const abilities = await provider.getAbilities();
					const owns = abilities.some( ( a: { name?: string } ) => a?.name === name );
					if ( owns ) {
						return provider.executeAbility( name, args );
					}
				}
				throw new Error( `No provider handled ability: ${ name }` );
			},
		};
	}

	// Merge getChatComponent: try each provider, return first non-null.
	if ( allGetChatComponents.length === 1 ) {
		mergedGetChatComponent = allGetChatComponents[ 0 ];
	} else if ( allGetChatComponents.length > 1 ) {
		mergedGetChatComponent = ( ( type: string ) => {
			for ( const fn of allGetChatComponents ) {
				const result = fn( type as ChatComponentType );
				if ( result ) {
					return result;
				}
			}
			return null;
		} ) as GetChatComponent;
	}

	// Merge useAbilitiesSetup: call ALL providers' hooks.
	if ( allAbilitiesSetups.length === 1 ) {
		mergedAbilitiesSetup = allAbilitiesSetups[ 0 ];
	} else if ( allAbilitiesSetups.length > 1 ) {
		mergedAbilitiesSetup = ( ( actions ) => {
			for ( const fn of allAbilitiesSetups ) {
				fn( actions );
			}
		} ) as AbilitiesSetupHook;
	}

	// Merge useSuggestions: combine from all providers, dedupe by id.
	if ( allUseSuggestions.length === 1 ) {
		mergedUseSuggestions = allUseSuggestions[ 0 ];
	} else if ( allUseSuggestions.length > 1 ) {
		mergedUseSuggestions = ( ( maxSuggestions?: number ) => {
			const combined: Suggestion[] = [];
			const seenIds = new Set< string >();
			for ( const hook of allUseSuggestions ) {
				const { suggestions } = hook( maxSuggestions );
				for ( const s of suggestions ) {
					if ( ! seenIds.has( s.id ) ) {
						seenIds.add( s.id );
						combined.push( s );
					}
				}
			}
			return { suggestions: combined };
		} ) as UseSuggestionsHook;
	}

	// Merge getEmptyViewSuggestions: combine from all providers, dedupe by id.
	if ( allGetEmptyViewSuggestions.length === 1 ) {
		mergedGetEmptyViewSuggestions = allGetEmptyViewSuggestions[ 0 ];
	} else if ( allGetEmptyViewSuggestions.length > 1 ) {
		mergedGetEmptyViewSuggestions = () => {
			const combined: Suggestion[] = [];
			const seenIds = new Set< string >();
			for ( const fn of allGetEmptyViewSuggestions ) {
				for ( const s of fn() ) {
					if ( ! seenIds.has( s.id ) ) {
						seenIds.add( s.id );
						combined.push( s );
					}
				}
			}
			return combined;
		};
	}

	return {
		toolProvider: mergedToolProvider,
		contextProvider: mergedContextProvider,
		getEmptyViewSuggestions: mergedGetEmptyViewSuggestions,
		markdownComponents: mergedMarkdownComponents,
		markdownExtensions: mergedMarkdownExtensions,
		useNavigationContinuation: mergedNavigationContinuation,
		useAbilitiesSetup: mergedAbilitiesSetup,
		useSuggestions: mergedUseSuggestions,
		getChatComponent: mergedGetChatComponent,
		siteBuildUtils: mergedSiteBuildUtils,
		useImageUpload: mergedImageUpload,
		useCheckpoint: mergedUseCheckpoint,
	};
}
