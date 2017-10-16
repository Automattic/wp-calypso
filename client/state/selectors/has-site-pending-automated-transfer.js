/**
 * External dependencies
 *
 * @format
 */

import { get } from 'lodash';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import { isSiteAutomatedTransfer, isSiteSignupStore, getSiteOptions } from 'state/selectors';

/**
 * Indicates whether there might be an Automated Transfer process running on the backend for
 * a given site.
 *
 * For example, if a site is created through the 'store' signup flow and its plan is paid,
 * we try to transfer the site (automatically on the backend) so it can become a Store/Woo site.
 * However, the transfer process might not start immediately because of the transfer eligibility
 * reasons. That's where this selector comes handy.
 *
 * @param   {Object}  state  App state.
 * @param   {Number}  siteId Site of interest.
 * @returns {Boolean}        Whether there might be a transfer process happening on the backend.
 */
export default ( state, siteId ) => {
	// If the site is an Atomic one, there is no Automated Transfer process happening on the backend.
	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		return false;
	}

	const siteOptions = getSiteOptions( state, siteId );
	const siteCreationDate = moment( get( siteOptions, 'created_at', null ) );

	if ( ! siteCreationDate ) {
		return false;
	}

	// Site is considered new if it was created less or equal than 10 minutes ago.
	const isSiteNewlyCreated = moment().diff( siteCreationDate, 'minutes' ) <= 10;

	if ( isSiteSignupStore( state, siteId ) && isSiteNewlyCreated ) {
		return true;
	}

	return false;
};
