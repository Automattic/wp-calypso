/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

export const getTemplates = ( state: State, verticalId: string ) => {
	return state.templates[ verticalId ];
};
