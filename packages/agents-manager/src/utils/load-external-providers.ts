/**
 * External Provider Loading Utility
 *
 * Loads external agent providers registered via the agents_manager_agent_providers
 * PHP filter. Each provider module should export toolProvider and/or contextProvider.
 */

import { getAgentManager, UIMessage } from '@automattic/agenttic-client';
import type { ToolProvider, ContextProvider, Suggestion, BigSkyMessage } from '../types';
import type { SubmitOptions, UseAgentChatReturn } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions } from '@automattic/agenttic-ui';

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
 * Navigation continuation hook type - provided by environments that support
 * navigation with conversation continuation (e.g., wp-admin/navigate)
 * This is needed to send a follow-up after full page reloads in wp-admin
 */
export type NavigationContinuationHook = ( props: {
	isProcessing: boolean;
	onSubmit: ( message: string, options?: SubmitOptions ) => Promise< void >;
	sessionId: string;
	agentId: string;
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

export interface LoadedProviders {
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	suggestions?: Suggestion[];
	markdownComponents?: MarkdownComponents;
	markdownExtensions?: MarkdownExtensions;
	useNavigationContinuation?: NavigationContinuationHook;
	useAbilitiesSetup?: AbilitiesSetupHook;
	getChatComponent?: GetChatComponent;
	siteBuildUtils?: SiteBuildUtils;
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
	let mergedSuggestions: Suggestion[] | undefined;
	let mergedMarkdownComponents: MarkdownComponents | undefined;
	let mergedMarkdownExtensions: MarkdownExtensions | undefined;
	let mergedNavigationContinuation: NavigationContinuationHook | undefined;
	let mergedAbilitiesSetup: AbilitiesSetupHook | undefined;
	let mergedGetChatComponent: GetChatComponent | undefined;
	let mergedSiteBuildUtils: SiteBuildUtils | undefined;

	for ( const moduleId of agentProviders ) {
		try {
			// Dynamic import of registered script module
			// The webpackIgnore comment tells webpack not to bundle this - it's loaded at runtime
			const module = await import( /* webpackIgnore: true */ moduleId );

			if ( module.toolProvider ) {
				mergedToolProvider = module.toolProvider;
			}
			if ( module.contextProvider ) {
				mergedContextProvider = module.contextProvider;
			}
			if ( module.suggestions ) {
				mergedSuggestions = module.suggestions;
			}
			if ( module.markdownComponents ) {
				mergedMarkdownComponents = module.markdownComponents;
			}
			if ( module.markdownExtensions ) {
				mergedMarkdownExtensions = module.markdownExtensions;
			}
			if ( module.useNavigationContinuation ) {
				mergedNavigationContinuation = module.useNavigationContinuation;
			}
			if ( module.useAbilitiesSetup ) {
				mergedAbilitiesSetup = module.useAbilitiesSetup;
			}
			if ( module.getChatComponent ) {
				mergedGetChatComponent = module.getChatComponent;
			}
			if ( module.siteBuildUtils ) {
				mergedSiteBuildUtils = module.siteBuildUtils;
			}

			// eslint-disable-next-line no-console
			console.log( `[AgentsManager] Loaded provider "${ moduleId }"` );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( `[AgentsManager] Failed to load provider "${ moduleId }":`, error );
		}
	}

	return {
		toolProvider: mergedToolProvider,
		contextProvider: mergedContextProvider,
		suggestions: mergedSuggestions,
		markdownComponents: mergedMarkdownComponents,
		markdownExtensions: mergedMarkdownExtensions,
		useNavigationContinuation: mergedNavigationContinuation,
		useAbilitiesSetup: mergedAbilitiesSetup,
		getChatComponent: mergedGetChatComponent,
		siteBuildUtils: mergedSiteBuildUtils,
	};
}
