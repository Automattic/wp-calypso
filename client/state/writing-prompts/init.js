import { registerReducer } from 'calypso/state/redux-store';
import writingPromptReducer from './reducer';

registerReducer( [ 'writingPrompt' ], writingPromptReducer );
