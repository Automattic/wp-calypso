import { withStorageKey } from '@automattic/state-utils';
import { WRITING_PROMPT_RECEIVE } from 'calypso/state/action-types';
import { keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import { writingPrompt as writingPromptSchema } from './schema';

const writingPromptReducer = keyedReducer(
	'siteId',
	withSchemaValidation( writingPromptSchema, ( state = {}, action ) => {
		switch ( action.type ) {
			case WRITING_PROMPT_RECEIVE:
				return action.writingPrompt;
		}
		return state;
	} )
);

export default withStorageKey( 'writingPrompt', writingPromptReducer );
