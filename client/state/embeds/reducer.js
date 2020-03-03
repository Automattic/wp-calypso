/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { EMBED_RECEIVE, EMBEDS_RECEIVE } from 'state/action-types';
import { normalizeEmbeds } from './utils';

/**
 * Returns the updated site embed items state after an action has been
 * dispatched. The state reflects a mapping of site ID to an array,
 * containing the embed items of the site with that ID.
 *
 * @param   {object} state  Current state
 * @param   {object} action Action payload
 * @returns {object}        Updated state
 */
export const siteItems = ( state = {}, action ) => {
	switch ( action.type ) {
		case EMBEDS_RECEIVE: {
			const { siteId, embeds } = action;
			return {
				...state,
				[ siteId ]: normalizeEmbeds( embeds ),
			};
		}
	}

	return state;
};

/**
 * Returns the updated embed item state after an action has been
 * dispatched. The state reflects a mapping of a URL to an object,
 * containing the embed item data corresponding to that embeddable URL.
 *
 * @param   {object} state  Current state
 * @param   {object} action Action payload
 * @returns {object}        Updated state
 */
export const urlItems = ( state = {}, action ) => {
	switch ( action.type ) {
		case EMBED_RECEIVE: {
			const { url, embed, siteId } = action;
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ url ]: {
						body: embed.result,
						scripts: embed.scripts,
						styles: embed.styles,
					},
				},
			};
		}
	}

	return state;
};

export default combineReducers( {
	siteItems,
	urlItems,
} );
