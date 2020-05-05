/**
 * Internal dependencies
 */
import { Vertical } from './types';

export const receiveVerticals = ( verticals: Vertical[] ) => ( {
	type: 'RECEIVE_VERTICALS' as const,
	verticals,
} );

export type Action = ReturnType< typeof receiveVerticals >;
