/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the u2f keys of the current user.
 *
 * @param  {Object} state Global state tree
 * @return {Array}        U2f Keys
 */
export default state =>
	get(
		state,
		[ 'u2fKeys', 'items' ],
		[
			{ id: '12:34:56:78', registered: 'Oct 3, 2018 11:22:33' },
			{ id: '13:34:56:78', registered: 'Oct 4, 2018 11:22:33' },
			{ id: '14:34:56:78', registered: 'Oct 5, 2018 11:22:33' },
			{ id: '15:34:56:78', registered: 'Oct 6, 2018 11:22:33' },
		]
	);
