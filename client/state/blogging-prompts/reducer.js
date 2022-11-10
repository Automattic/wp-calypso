import { withStorageKey } from '@automattic/state-utils';
import { BLOGGING_PROMPT_RECEIVE } from 'calypso/state/action-types';
import { keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import { bloggingPrompt as bloggingPromptSchema } from './schema';

const bloggingPromptReducer = keyedReducer(
	'siteId',
	withSchemaValidation( bloggingPromptSchema, ( state = {}, action ) => {
		switch ( action.type ) {
			case BLOGGING_PROMPT_RECEIVE:
				return action.bloggingPrompt;
		}
		return state;
	} )
);

export default withStorageKey( 'bloggingPrompt', bloggingPromptReducer );
