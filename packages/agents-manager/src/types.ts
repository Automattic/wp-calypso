/**
 * Common types used across the agents-manager package.
 */

export type {
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
} from './extension-types';

export type ConversationType = 'orchestrator' | 'odie' | 'zendesk';

export interface Conversation {
	type: ConversationType;
	id: string;
	createdAt: number;
	message: {
		received: number;
		role: string;
		text: string;
	};
}
