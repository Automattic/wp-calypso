/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getVerticals = ( state, searchTerm = '', siteTypeId ) =>
	get( state, [ 'signup', 'verticals', siteTypeId, searchTerm.trim().toLowerCase() ], null );
