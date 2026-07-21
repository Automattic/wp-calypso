export type { Ability } from '@wordpress/abilities';

export type ShowComponentType = 'button-picker' | 'font-picker' | 'color-picker';

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
