/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;
export const getCurrentUser = ( state: State ) => state.currentUser;
export const getNewUser = ( state: State ) => state.newUser;
