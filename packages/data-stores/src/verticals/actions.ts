/**
 * Internal dependencies
 */
import { ActionType, Vertical } from './types';

export const receiveVerticals = ( verticals: Vertical[] ) => ( {
	type: ActionType.RECEIVE_VERTICALS as const,
	verticals,
} );

export type Action = ReturnType< typeof receiveVerticals >;
