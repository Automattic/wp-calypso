/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import getSiteOptions from 'calypso/state/selectors/get-site-options';

import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';

/**
 * Indicates whether there might be an Automated Transfer process running on the backend for
 * a given site.
 *
 * For example, if a site is created through the 'store' signup flow and its plan is paid,
 * we try to transfer the site (automatically on the backend) so it can become a Store/Woo site.
 * However, the transfer process might not start immediately because of the transfer eligibility
 * reasons. That's where this selector comes handy.
 *
 * @param   {object}  state  App state.
 * @param   {number}  siteId Site of interest.
 * @returns {boolean}        Whether there might be a transfer process happening on the backend.
 */
export default ( state, siteId ) => {
	const siteOptions = getSiteOptions( state, siteId );

	if ( ! siteOptions ) {
		return null;
	}

	// If the site is an Atomic one, there is no Automated Transfer process happening on the backend.
	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		return false;
	}

	return get( siteOptions, 'has_pending_automated_transfer', false );
};
