/**
 * External dependencies
 */
import { last } from 'lodash';

/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

/**
 * Returns true if the eCommerce manage nudge has been dismissed by the current user.
 *
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The Id of the site
 * @returns {boolean} True if the nudge has been dismissed
 */
export default function isECommerceManageNudgeDismissed( state, siteId ) {
	const preference = getPreference( state, 'ecommerce-manage-dismissible-nudge' ) || {};
	const sitePreference = preference[ siteId ] || [];
	const lastEvent = last( sitePreference.filter( ( event ) => 'dismiss' === event.type ) );
	return lastEvent ? true : false;
}
