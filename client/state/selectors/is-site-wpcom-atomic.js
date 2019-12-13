/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retruns true if the questioned site is a WPCOM Atomic site.
 *
 * @param {Object} state the global state tree
 * @param {Number} siteId the questioned site ID.
 * @return {Boolean} Whether the site is a WPCOM Atomic site.
 */
export default ( state, siteId ) =>
	get( state, [ 'sites', 'items', siteId, 'options', 'is_wpcom_atomic' ], false );
