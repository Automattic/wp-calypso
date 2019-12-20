/**
 * Internal dependencies
 */
import { VerticalsActionType as ActionType, Vertical } from './types';

export const receiveVerticals = ( verticals: Vertical[] ) => ( {
	type: ActionType.RECEIVE_VERTICALS as const,
	verticals,
} );
