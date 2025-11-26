/**
 * External Provider Loading Utility
 *
 * Loads external agent providers registered via the help_center_agent_providers
 * PHP filter. Each provider module should export toolProvider and/or contextProvider.
 */

import type { ToolProvider, ContextProvider, Suggestion } from '@automattic/agents-manager';
import type { MarkdownComponents, MarkdownExtensions } from '@automattic/agenttic-ui';

// helpCenterData is set as a global const via wp_add_inline_script
declare const helpCenterData: { agentProviders?: string[] } | undefined;

export interface LoadedProviders {
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	suggestions?: Suggestion[];
	markdownComponents?: MarkdownComponents;
	markdownExtensions?: MarkdownExtensions;
}

/**
 * Load external agent providers from helpCenterData.agentProviders.
 *
 * Each provider module ID is dynamically imported using WordPress's script module
 * system. Modules should export { toolProvider, contextProvider }.
 * @returns Promise resolving to merged providers or empty object if none found.
 */
export async function loadExternalProviders(): Promise< LoadedProviders > {
	const agentProviders = helpCenterData?.agentProviders || [];

	if ( agentProviders.length === 0 ) {
		return {};
	}

	let mergedToolProvider: ToolProvider | undefined;
	let mergedContextProvider: ContextProvider | undefined;
	let mergedSuggestions: Suggestion[] | undefined;
	let mergedMarkdownComponents: MarkdownComponents | undefined;
	let mergedMarkdownExtensions: MarkdownExtensions | undefined;

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

			// eslint-disable-next-line no-console
			console.log( `[HelpCenter] Loaded provider "${ moduleId }"` );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( `[HelpCenter] Failed to load provider "${ moduleId }":`, error );
		}
	}

	return {
		toolProvider: mergedToolProvider,
		contextProvider: mergedContextProvider,
		suggestions: mergedSuggestions,
		markdownComponents: mergedMarkdownComponents,
		markdownExtensions: mergedMarkdownExtensions,
	};
}
