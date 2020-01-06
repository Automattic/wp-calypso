/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

/**
 * Get temporary site data
 *
 * @param state Store state
 */
export const getTemporaryBlog = ( state: State ) => {
    return state.temporaryBlog;
};


export const getTemporaryAccount = ( state: State ) => {
    return state.temporaryAccount;
};

