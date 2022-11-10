import { registerReducer } from 'calypso/state/redux-store';
import bloggingPromptReducer from './reducer';

registerReducer( [ 'bloggingPrompt' ], bloggingPromptReducer );
