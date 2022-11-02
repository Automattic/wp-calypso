import { WRITING_PROMPT_RECEIVE, WRITING_PROMPT_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/writing-prompt';
import 'calypso/state/checklist/init';

/**
 * Action creator function: WRITING_PROMPT_RECEIVE
 *
 * @param {string} siteId for the current site
 * @param {object} writingPrompt todays prompt
 * @returns {object} action object
 */
export function receiveWritingPrompt( siteId, writingPrompt ) {
	return {
		type: WRITING_PROMPT_RECEIVE,
		siteId,
		writingPrompt,
	};
}

/**
 * Action creator function: WRITING_PROMPT_REQUEST
 *
 * @param {string} siteId for the prompt
 * @returns {object} action object
 */
export const requestWritingPrompt = ( siteId ) => ( {
	type: WRITING_PROMPT_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );
