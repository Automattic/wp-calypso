/** @format */

/**
 * External dependencies
 */

import { get, isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import { getAutomatedTransfer } from 'state/automated-transfer/selectors';

/**
 * Returns whether we are already fetching the Automated Transfer status for given siteId.
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {?Boolean} whether we are fetching transfer status for given siteId
 */
export default ( state, siteId ) => {
	if ( ! siteId ) {
		return null;
	}

	const siteTransfer = getAutomatedTransfer( state, siteId );

	if ( ! siteTransfer || isEmpty( siteTransfer ) ) {
		return null;
	}

	return get( siteTransfer, 'fetchingStatus', false );
};
