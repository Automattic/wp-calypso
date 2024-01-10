import { FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

/**
 * Get the maximum number of email forwards permitted for site.
 * @param {Object} state - global state tree
 * @param {number|undefined} siteId - identifier of the site
 * @returns {number} Returns the maximum email forwards allowed for site.
 */
export function getEmailForwardLimit( state, siteId ) {
	return siteHasFeature( state, siteId, FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT ) ? 100 : 25;
}
