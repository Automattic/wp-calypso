/**
 * Internal dependencies
 */
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZE,
	DIRECTLY_SCRIPT_LOAD_FAILURE
} from 'state/action-types';

export const askQuestion = ( { questionText, name, email } ) => ( {
	type: DIRECTLY_ASK_QUESTION,
	questionText,
	name,
	email
} );

// See README for list of options
export const initialize = ( config = {} ) => ( {
	type: DIRECTLY_INITIALIZE,
	config: config
} );

export const scriptLoadFailure = ( error ) => ( {
	type: DIRECTLY_SCRIPT_LOAD_FAILURE,
	error
} );
