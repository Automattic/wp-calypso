/**
 * Internal dependencies
 */
import { SIGNUP_VERTICALS_REQUEST, SIGNUP_VERTICALS_SET } from 'state/action-types';

import 'state/data-layer/wpcom/signup/verticals';
import 'state/signup/init';

/**
 * Action creator: Request verticals data.
 *
 * @param {string} search The search term for requesting the matching verticals.
 * @param {string} siteType Site type relevant for given search term
 * @param {number} limit The maximum number of vertical items.
 *
 * @returns {object} The action object.
 */
export const requestVerticals = ( search, siteType, limit ) => ( {
	type: SIGNUP_VERTICALS_REQUEST,
	search,
	siteType,
	limit,
} );

/**
 * Action creator: Store verticals found for a given search term in the state tree.
 *
 * @param {string} search The search term which the verticals data matching with.
 * @param {string} siteType Site type relevant for given search term
 * @param {Array} verticals The verticals data matches with the given search term.
 *
 * @returns {object} The action object.
 */
export const setVerticals = ( search, siteType, verticals ) => ( {
	type: SIGNUP_VERTICALS_SET,
	search,
	siteType,
	verticals,
} );
