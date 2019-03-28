/** @format */

/**
 * External dependencies
 */
import { get, toLower, trim } from 'lodash';

export const getVerticals = ( state, searchTerm ) =>
	get( state, [ 'signup', 'verticals', trim( toLower( searchTerm ) ) ], null );
