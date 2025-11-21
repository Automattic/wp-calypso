/**
 * AI Agents Package
 *
 * Provides AI agent dock and sidebar components with multi-context support.
 * Includes flexible adapters for different environments (WordPress, Calypso, generic).
 */

// Default export for AsyncLoad integration in Calypso
export { default } from './components/unified-ai-agent';

// Main Components
export { default as ChatLayoutManager } from './components/chat-layout-manager';
export { default as AgentDock } from './components/agent-dock';
export { default as UnifiedAIAgent } from './components/unified-ai-agent';
export { default as ChatHeader } from './components/chat-header';
export { default as BigSkyIcon } from './components/big-sky-icon';

// Hooks
export { useChatState, useAgentSession } from './hooks';

// Adapters
export {
	// Context Adapters
	GenericContextAdapter,
	WordPressContextAdapter,
	CalypsoContextAdapter,
} from './adapters';

// Abilities
export { AbilityRegistry, defaultAbilityRegistry } from './abilities';

// Configuration
export { createAgentConfig, createSimpleAgentConfig } from './config';

// Authentication
export {
	createCalypsoAuthProvider,
	defaultCalypsoErrorHandler,
} from './auth/calypso-auth-provider';
export type { CalypsoAuthError, CalypsoErrorHandler } from './auth/calypso-auth-provider';

// Types
export type {
	// Adapter Types
	ContextAdapter,
	ClientContext,
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
	ChatLayoutManagerProps,
	ChatLayoutManagerRenderProps,
	AgentDockProps,
} from './types';
export type { UnifiedAIAgentProps } from './components/unified-ai-agent';
export type { ChatHeaderProps, ChatHeaderMenuItem } from './components/chat-header';
export type { BigSkyIconProps } from './components/big-sky-icon';
