/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;
export const getDomainSuggestions = ( state: State ) => state.domainSuggestions;
