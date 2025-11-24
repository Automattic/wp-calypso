/**
 * Common types for AI Agents package
 */

export type { Ability, AbilityLoader } from './abilities';
export type { ContextAdapter, ClientContext } from './adapters/context/context-adapter';
export type { CreateAgentConfigOptions } from './config/create-agent-config';
export type { ChatState, UseChatStateOptions, UseChatStateResult } from './hooks/use-chat-state';
export type { UseAgentSessionOptions, UseAgentSessionResult } from './hooks/use-agent-session';
export type {
	ChatLayoutManagerProps,
	ChatLayoutManagerRenderProps,
} from './components/chat-layout-manager';
export type { AgentDockProps } from './components/agent-dock';
