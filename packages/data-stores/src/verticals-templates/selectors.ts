/**
 * Internal dependencies
 */
import { State } from './reducer';
import { getVerticalTemplateKey } from './utils';

/**
 * Get template suggestions
 *
 * @param state Store state
 * @param verticalId Vertical ID, e.g. `"p13v1"`
 */
export const getTemplates = ( state: State, verticalId: string ) => {
	return state.templates[ verticalId ];
};

/**
 * Get template suggestions
 *
 * @param state Store state
 * @param verticalId Vertical ID, e.g. `"p13v1"`
 * @param templateSlug Template slug, e.g. `"barnsbury"`
 */
export const getVerticalTemplate = ( state: State, verticalId: string, templateSlug: string ) => {
	return state.verticalTemplates[ getVerticalTemplateKey( verticalId, templateSlug ) ];
};
