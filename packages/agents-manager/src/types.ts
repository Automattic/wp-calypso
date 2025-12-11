/**
 * Common types used across the agents-manager package.
 */

import { ODIE_ALLOWED_BOTS } from './constants';

export type {
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
} from './extension-types';

export type SupportProvider = 'zendesk' | 'odie' | 'zendesk-staging' | 'help-center';

export type OdieAllowedBots = ( typeof ODIE_ALLOWED_BOTS )[ number ];

export interface SupportInteractionUser {
	user_id: string;
	provider: 'wpcom';
	is_owner: boolean;
}

export interface SupportInteractionEvent {
	event_external_id: string;
	event_source: SupportProvider;
	metadata?: object;
	event_order?: number;
}

export interface SupportInteraction {
	bot_slug: OdieAllowedBots;
	uuid: string;
	status: 'open' | 'closed' | 'resolved' | 'solved';
	start_date: string;
	last_updated: string;
	users: SupportInteractionUser[];
	events: SupportInteractionEvent[];
	environment: 'staging' | 'production';
}

export interface Conversation {
	type: 'orchestrator' | 'odie' | 'zendesk';
	id: string;
	createdAt: number;
	message: {
		received: number;
		role: string;
		text: string;
	};
}
