/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const isA8cTeamMember = ( state: State ): boolean =>
	!! ( state.teams || [] ).find( ( team ) => team.slug === 'a8c' );
