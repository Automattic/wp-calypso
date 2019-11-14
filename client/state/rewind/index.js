/**
 * Internal dependencies
 */
import { REWIND_STATE_UPDATE } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const rewindItem = ( state = null, { type, data } ) =>
	type === REWIND_STATE_UPDATE ? data : state;

export const rewindReducer = keyedReducer( 'siteId', rewindItem );
