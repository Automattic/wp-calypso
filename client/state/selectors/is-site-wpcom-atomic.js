/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retruns true if the questioned site is a WPCOM Atomic site.
 *
 * @param {object} state the global state tree
 * @param {number} siteId the questioned site ID.
 * @returns {boolean} Whether the site is a WPCOM Atomic site.
 */
export default ( state, siteId ) =>
	get( state, [ 'sites', 'items', siteId, 'options', 'is_wpcom_atomic' ], false );
