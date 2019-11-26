/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

/**
 *
 * @param state Store state
 * @param verticalId Vertical ID, e.g. `"p13v1"`
 */
export const getTemplates = ( state: State, verticalId: string ) => {
	return state.templates[ verticalId ];
};
