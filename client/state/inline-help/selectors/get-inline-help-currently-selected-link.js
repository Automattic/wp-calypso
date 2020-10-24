/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getInlineHelpCurrentlySelectedResult from 'calypso/state/inline-help/selectors/get-inline-help-currently-selected-result';

import 'calypso/state/inline-help/init';

/**
 * Returns the link / href of the selected search result item
 *
 * @param  {object}  state  Global state tree
 * @returns {string}        The href of the selected link target
 */
export default function getInlineHelpCurrentlySelectedLink( state ) {
	const result = getInlineHelpCurrentlySelectedResult( state );
	return get( result, 'link', '' );
}
