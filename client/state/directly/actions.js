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

export const initialize = ( options = {} ) => ( {
	type: DIRECTLY_INITIALIZE,
	options: options
} );

export const scriptLoadFailure = ( error ) => ( {
	type: DIRECTLY_SCRIPT_LOAD_FAILURE,
	error
} );
