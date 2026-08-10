export type { Ability } from '@wordpress/abilities';

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
