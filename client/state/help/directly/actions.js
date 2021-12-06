import * as directly from 'calypso/lib/directly';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import 'calypso/state/help/init';

export const askQuestion = ( questionText, name, email ) => async ( dispatch ) => {
	dispatch( { type: DIRECTLY_ASK_QUESTION } );
	await directly.askQuestion( questionText, name, email );
	dispatch( recordTracksEvent( 'calypso_directly_ask_question' ) );
};

export const initialize = () => async ( dispatch ) => {
	dispatch( { type: DIRECTLY_INITIALIZATION_START } );
	dispatch( recordTracksEvent( 'calypso_directly_initialization_start' ) );

	try {
		await directly.initialize();
		dispatch( recordTracksEvent( 'calypso_directly_initialization_success' ) );
		dispatch( { type: DIRECTLY_INITIALIZATION_SUCCESS } );
	} catch ( error ) {
		dispatch(
			recordTracksEvent( 'calypso_directly_initialization_error', {
				error: error ? error.toString() : 'Unknown error',
			} )
		);
		dispatch( { type: DIRECTLY_INITIALIZATION_ERROR } );
	}
};
