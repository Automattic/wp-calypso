/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';

// FIXME: No-op reducers
export const logError = keyedReducer( 'siteId', state => state );
export const logItems = keyedReducer( 'siteId', state => state );
