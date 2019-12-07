/**
 * Internal dependencies
 */
import { SIGNUP_VERTICALS_REQUEST, SIGNUP_VERTICALS_SET } from 'state/action-types';

import 'state/data-layer/wpcom/signup/verticals';

/**
 * Action creator: Request verticals data.
 *
 * @param {String} search The search term for requesting the matching verticals.
 * @param {String} siteType Site type relevant for given search term
 * @param {Number} limit The maximum number of vertical items.
 *
 * @return {Object} The action object.
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
 * @param {String} search The search term which the verticals data matching with.
 * @param {String} siteType Site type relevant for given search term
 * @param {Array} verticals The verticals data matches with the given search term.
 *
 * @return {Object} The action object.
 */
export const setVerticals = ( search, siteType, verticals ) => ( {
	type: SIGNUP_VERTICALS_SET,
	search,
	siteType,
	verticals,
} );
