/**
 * Internal dependencies
 */
// import {
// 	REWIND_STATUS_ERROR,
// 	REWIND_STATUS_UPDATE,
// } from 'state/action-types';
import { keyedReducer } from 'state/utils';

// FIXME: No-op reducers
export const logError = keyedReducer( 'siteId', state => state );
export const logItems = keyedReducer( 'siteId', state => state );
