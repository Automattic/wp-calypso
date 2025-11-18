/**
 * Common types for AI Agents package
 */

export type { Ability, AbilityLoader } from './abilities';
export type { ContextAdapter, ClientContext } from './adapters/context/ContextAdapter';
export type { ChromeAdapter } from './adapters/chrome/ChromeAdapter';
export type { CreateAgentConfigOptions } from './config/createAgentConfig';
export type { ChatState, UseChatStateOptions, UseChatStateResult } from './hooks/useChatState';
export type { UseAgentSessionOptions, UseAgentSessionResult } from './hooks/useAgentSession';
export type { AgentsManagerProps, AgentsManagerRenderProps } from './components/AgentsManager';
export type { AgentDockProps } from './components/AgentDock';
