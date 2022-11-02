import moment from 'moment';
import { WRITING_PROMPT_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveWritingPrompt } from 'calypso/state/writing-prompts/actions';
const noop = () => {};

// Transform the response to a data / schema calypso understands
const fromApi = ( payload ) => {
	const prompt = payload && payload.prompts && payload.prompts[ 0 ];
	if ( ! prompt ) {
		return null;
	}
	return {
		id: prompt.id,
		text: prompt.text,
	};
};

export const fetchWritingPrompt = ( action ) => {
	const today = moment().format( 'YYYY-MM-DD' );
	return http(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/blogging-prompts?number=1&from=${ today }`,
			method: 'GET',
			query: {
				http_envelope: 1,
			},
		},
		action
	);
};

export const receiveWritingPromptSuccess = ( action, writingPrompt ) => {
	return receiveWritingPrompt( action.siteId, writingPrompt );
};

const dispatchWritingPromptRequest = dispatchRequest( {
	fetch: fetchWritingPrompt,
	onSuccess: receiveWritingPromptSuccess,
	onError: noop,
	fromApi,
} );

registerHandlers( 'state/data-layer/wpcom/writing-prompt/index.js', {
	[ WRITING_PROMPT_REQUEST ]: [ dispatchWritingPromptRequest ],
} );
