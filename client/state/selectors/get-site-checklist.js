/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';

/**
 * Returns the checklist for the specified site ID if eligible
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}        Site settings
 */
export default function getSiteChecklist( state, siteId ) {
	return ! isEligibleForDotcomChecklist( state, siteId )
		? null
		: get( state.checklist, [ siteId, 'items' ], null );
}
