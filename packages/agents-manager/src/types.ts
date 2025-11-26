/**
 * Common types for AI Agents package
 */

export type { Ability, AbilityLoader } from './abilities';
export type { UseAgentSessionOptions, UseAgentSessionResult } from './hooks/use-agent-session';
export type { AgentDockProps } from './components/agent-dock';

export type {
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
} from './extension-types';
