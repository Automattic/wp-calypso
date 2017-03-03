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
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZED,
	DIRECTLY_MAXIMIZING,
	DIRECTLY_MINIMIZING,
	DIRECTLY_OPENING_ASK_FORM,
} from 'state/action-types';

export const askQuestion = ( questionText, name, email ) => ( dispatch ) => {
	dispatch( { type: DIRECTLY_ASK_QUESTION, questionText, name, email } );
	askDirectlyQuestion( questionText, name, email );
};

// See README for list of options
export const initialize = ( config = {} ) => ( dispatch ) => {
	initializeDirectly( config );
	dispatch( { type: DIRECTLY_INITIALIZED, config } );
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
