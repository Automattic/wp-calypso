/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const getState = ( state: State ) => state;
export const getWhatsNewList = ( state: State ) => state.whatsNewList;
