/**
 * Jetpack AI Sidebar Entry Point
 *
 * Entry point for the standalone Jetpack AI sidebar provider bundle.
 * This is built as an IIFE and loaded by the PHP loader in Jetpack.
 * The ESM wrapper (jetpack-ai-sidebar.provider.mjs) re-exports from
 * window.__JetpackAIProvider for Agents Manager to consume.
 */

/**
 * External dependencies
 */
import {
	useAbilitiesSetup,
	toolProvider,
	contextProvider,
	getChatComponent,
	getEmptyViewSuggestions,
	useSuggestions,
	useCheckpoint,
	capabilities,
	registerBlockEditorFilters,
} from '@automattic/jetpack-ai-sidebar';

registerBlockEditorFilters();

const providerId = 'jetpack-ai-sidebar';

// Expose on window for the ESM wrapper to re-export
window.__JetpackAIProvider = {
	providerId,
	useAbilitiesSetup,
	toolProvider,
	contextProvider,
	getChatComponent,
	getEmptyViewSuggestions,
	useSuggestions,
	useCheckpoint,
	capabilities,
};
