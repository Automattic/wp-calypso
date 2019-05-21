/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getVerticals = ( state, searchTerm = '', siteType = '' ) =>
	get(
		state,
		[
			'signup',
			'verticals',
			( siteType || '' ).trim().toLowerCase(),
			searchTerm.trim().toLowerCase(),
		],
		null
	);
