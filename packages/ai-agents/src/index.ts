/**
 * AI Agents Package
 *
 * Provides AI agent dock and sidebar components with multi-context support.
 * Includes flexible adapters for different environments (WordPress, Calypso, generic).
 */

// Default export for AsyncLoad integration in Calypso
export { default } from './components/CalypsoAIAgent';

// Main Components
export { default as AgentsManager } from './components/AgentsManager';
export { default as AgentDock } from './components/AgentDock';
export { default as CalypsoAIAgent } from './components/CalypsoAIAgent';
export { default as ChatHeader } from './components/shared/ChatHeader';

// Hooks
export { useChatState, useAgentSession } from './hooks';

// Adapters
export {
	// Context Adapters
	GenericContextAdapter,
	WordPressContextAdapter,
	CalypsoContextAdapter,
	// Chrome Adapters
	GenericChromeAdapter,
	WordPressChromeAdapter,
	CalypsoChromeAdapter,
} from './adapters';

// Abilities
export { AbilityRegistry, defaultAbilityRegistry } from './abilities';

// Configuration
export { createAgentConfig, createSimpleAgentConfig } from './config';

// Types
export type {
	// Adapter Types
	ContextAdapter,
	ClientContext,
	ChromeAdapter,
	// Ability Types
	Ability,
	AbilityLoader,
	// Config Types
	CreateAgentConfigOptions,
	// Hook Types
	ChatState,
	UseChatStateOptions,
	UseChatStateResult,
	UseAgentSessionOptions,
	UseAgentSessionResult,
	// Component Types
	AgentsManagerProps,
	AgentsManagerRenderProps,
	AgentDockProps,
} from './types';
export type { CalypsoAIAgentProps } from './components/CalypsoAIAgent';
export type { ChatHeaderProps, ChatHeaderMenuItem } from './components/shared/ChatHeader';
