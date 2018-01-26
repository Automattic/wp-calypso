/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @param {Number} siteId - site ID
 * @return {Boolean} Signals whether or not there is currently a request in progress for the given siteId
 */
export default ( state, siteId ) => get( state, [ 'siteRename', 'requesting', siteId ], null );
