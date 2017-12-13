/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default ( state, siteId ) => get( state, [ 'concierge', 'info', siteId ], null );
