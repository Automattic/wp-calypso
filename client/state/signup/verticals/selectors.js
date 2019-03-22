/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getVerticals = ( state, searchTerm ) =>
	get( state, [ 'signup', 'verticals', searchTerm ], null );
