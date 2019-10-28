/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;
export const getVertical = ( state: State, search: string ) => state.verticalSearches[ search ];
