/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the connected applications of the current user.
 *
 * @param  {Object} state Global state tree
 * @return {?Array}       Connected applications
 */
export default state => get( state, 'connectedApplications', null );
