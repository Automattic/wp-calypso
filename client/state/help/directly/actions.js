/**
 * Internal dependencies
 */
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/third-party/directly';

import 'calypso/state/help/init';

export function askQuestion( questionText, name, email ) {
	return { type: DIRECTLY_ASK_QUESTION, questionText, name, email };
}

export function initialize() {
	return { type: DIRECTLY_INITIALIZATION_START };
}

export function initializationCompleted() {
	return { type: DIRECTLY_INITIALIZATION_SUCCESS };
}

export function initializationFailed() {
	return { type: DIRECTLY_INITIALIZATION_ERROR };
}
