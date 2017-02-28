/**
 * Internal dependencies
 */
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZE,
} from 'state/action-types';

export function askQuestion( questionText, name, email ) {
	return { type: DIRECTLY_ASK_QUESTION, questionText, name, email };
}

export function initialize() {
	return { type: DIRECTLY_INITIALIZE };
}
