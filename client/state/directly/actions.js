/**
 * Internal dependencies
 */
import {
	initialize as initializeDirectly,
	askQuestion as askDirectlyQuestion,
	maximize as maximizeDirectly,
	minimize as minimizeDirectly,
	openAskForm as openDirectlyAskForm,
} from 'lib/directly';
import {
	DIRECTLY_ASKING_QUESTION,
	DIRECTLY_INITIALIZING,
	DIRECTLY_INITIALIZED,
	DIRECTLY_INITIALIZATION_ERROR,
	DIRECTLY_MAXIMIZING,
	DIRECTLY_MINIMIZING,
	DIRECTLY_OPENING_ASK_FORM,
} from 'state/action-types';

export const askQuestion = ( { questionText, name, email } ) => ( dispatch ) => {
	dispatch( { type: DIRECTLY_ASKING_QUESTION, questionText, name, email } );
	askDirectlyQuestion( { questionText, name, email } );
};

// See README for list of options
export const initialize = ( config = {} ) => ( dispatch ) => {
	dispatch( { type: DIRECTLY_INITIALIZING, config } );
	initializeDirectly( config, ( error ) => {
		if ( error ) {
			// TODO: Do something if there's an error
			dispatch( { type: DIRECTLY_INITIALIZATION_ERROR, error } );
		} else {
			dispatch( { type: DIRECTLY_INITIALIZED } );
		}
	} );
};

export const maximize = () => ( dispatch ) => {
	dispatch( { type: DIRECTLY_MAXIMIZING } );
	maximizeDirectly();
};

export const minimize = () => ( dispatch ) => {
	dispatch( { type: DIRECTLY_MINIMIZING } );
	minimizeDirectly();
};

export const openAskForm = () => ( dispatch ) => {
	dispatch( { type: DIRECTLY_OPENING_ASK_FORM } );
	openDirectlyAskForm();
};
