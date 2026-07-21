import type { SHOW_COMPONENT_TYPES } from './constants';

export type { Ability } from '@wordpress/abilities';

export type ShowComponentType = ( typeof SHOW_COMPONENT_TYPES )[ number ];

export interface AbilityResult {
	result: {
		success: boolean;
		message: string;
		error?: string;
		details?: Record< string, unknown >;
	};
	returnToAgent: boolean;
	agentMessage?: string;
}
