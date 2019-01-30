/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the loading state for the checklist API call
 *
 * @param  {Object}  state  Global state tree
 * @return {Bool}    Whether the checklist is loading
 */
export default function getSiteChecklistIsLoading( state ) {
	return get( state.checklist, 'isLoading', false );
}
