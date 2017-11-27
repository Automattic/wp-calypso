/** @format */
/**
 * Internal dependencies
 */
import { REWIND_STATE_UPDATE } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const rewindItem = (
	state = null,
	{ type, siteId, meta, ...data } // eslint-disable-line no-unused-vars
) => ( type === REWIND_STATE_UPDATE ? data : state );

export const rewindReducer = keyedReducer( 'siteId', rewindItem );
