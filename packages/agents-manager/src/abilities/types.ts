export type { Ability } from '@wordpress/abilities';

export type ShowComponentType = 'button-picker' | 'font-picker' | 'color-picker' | 'pattern-picker';

export interface AbilityResult {
	result: string;
	returnToAgent: boolean;
	agentMessage?: string;
}
