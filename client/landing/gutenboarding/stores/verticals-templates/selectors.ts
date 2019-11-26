/**
 * Internal dependencies
 */
import { State } from './reducer';

/**
 * Get template suggestions
 *
 * @param state Store state
 * @param verticalId Vertical ID, e.g. `"p13v1"`
 */
export const getTemplates = ( state: State, verticalId: string ) => {
	return state.templates[ verticalId ];
};
