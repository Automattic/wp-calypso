import { BLOGGING_PROMPT_RECEIVE, BLOGGING_PROMPT_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/blogging-prompt';
import 'calypso/state/checklist/init';

/**
 * Action creator function: BLOGGING_PROMPT_RECEIVE
 *
 * @param {string} siteId for the current site
 * @param {object} bloggingPrompt todays prompt
 * @returns {object} action object
 */
export function receiveBloggingPrompt( siteId, bloggingPrompt ) {
	return {
		type: BLOGGING_PROMPT_RECEIVE,
		siteId,
		bloggingPrompt,
	};
}

/**
 * Action creator function: BLOGGING_PROMPT_REQUEST
 *
 * @param {string} siteId for the prompt
 * @returns {object} action object
 */
export const requestBloggingPrompt = ( siteId ) => ( {
	type: BLOGGING_PROMPT_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
