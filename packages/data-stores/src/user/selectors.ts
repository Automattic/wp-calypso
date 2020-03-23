/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

export const getCurrentUser = ( state: State ) => state.currentUser;
export const isCurrentUserLoggedIn = ( state: State ) => !! state.currentUser?.ID;

export const getNewUser = ( state: State ) => state.newUser.data;
export const getNewUserError = ( state: State ) => state.newUser.error;
export const isFetchingNewUser = ( state: State ) => state.newUser.isFetching;
export const isNewUser = ( state: State ) => !! state.newUser.data;
