/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { DIRECTLY_ASK_QUESTION, DIRECTLY_INITIALIZATION_START } from 'state/action-types';
import { initializationCompleted, initializationFailed } from 'state/help/directly/actions';
import * as directly from 'lib/directly';

export function askQuestion( { dispatch }, action ) {
	return directly
		.askQuestion( action.questionText, action.name, action.email )
		.then( () => dispatch( recordTracksEvent( 'calypso_directly_ask_question' ) ) );
}

export function initialize( { dispatch } ) {
	dispatch( recordTracksEvent( 'calypso_directly_initialization_start' ) );

	return directly
		.initialize()
		.then( () =>
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_directly_initialization_success' ),
					initializationCompleted()
				)
			)
		)
		.catch( ( error ) =>
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_directly_initialization_error', {
						error: error ? error.toString() : 'Unknown error',
					} ),
					initializationFailed()
				)
			)
		);
}

registerHandlers( 'state/data-layer/third-party/directly', {
	[ DIRECTLY_ASK_QUESTION ]: [ askQuestion ],
	[ DIRECTLY_INITIALIZATION_START ]: [ initialize ],
} );
