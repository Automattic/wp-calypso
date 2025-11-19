/**
 * AI Agents Package
 *
 * Provides AI agent dock and sidebar components with multi-context support.
 * Includes flexible adapters for different environments (WordPress, Calypso, generic).
 */

// Default export for AsyncLoad integration in Calypso
export { default } from './components/calypso-ai-agent';

// Main Components
export { default as AgentsManager } from './components/agents-manager';
export { default as AgentDock } from './components/agent-dock';
export { default as CalypsoAIAgent } from './components/calypso-ai-agent';
export { default as ChatHeader } from './components/shared/chat-header';
export { default as BigSkyIcon } from './components/shared/big-sky-icon';

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

// Authentication
export { createCalypsoAuthProvider } from './auth/calypso-auth-provider';

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
export type { CalypsoAIAgentProps } from './components/calypso-ai-agent';
export type { ChatHeaderProps, ChatHeaderMenuItem } from './components/shared/chat-header';
export type { BigSkyIconProps } from './components/shared/big-sky-icon';
