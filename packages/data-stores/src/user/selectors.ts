import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getCurrentUser = ( state: State ) => state.currentUser;
export const isCurrentUserLoggedIn = ( state: State ) => !! state.currentUser?.ID;
export const isNewUser = ( state: State ) => state.isNewUser;
