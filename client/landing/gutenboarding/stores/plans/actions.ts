/**
 * Internal dependencies
 */
import { Plan } from './types';

export const setPlan = ( plan: Plan | undefined ) => ( {
	type: 'SET_PLAN' as const,
	plan,
} );
