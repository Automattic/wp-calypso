/**
 * ESM provider wrapper for the Jetpack AI sidebar.
 *
 * The IIFE bundle (jetpack-ai-sidebar.min.js) assigns exports to
 * window.__JetpackAIProvider. This thin ESM re-exports them so
 * Agents Manager can load the provider via dynamic import().
 */
const p = window.__JetpackAIProvider || {};
export const getChatComponent = p.getChatComponent;
export const getEmptyViewSuggestions = p.getEmptyViewSuggestions;
export const useSuggestions = p.useSuggestions;
export const toolProvider = p.toolProvider;
export const contextProvider = p.contextProvider;
export const useAbilitiesSetup = p.useAbilitiesSetup;
