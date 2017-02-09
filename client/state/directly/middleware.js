/**
 * Internal dependencies
 */
import directly from 'lib/directly';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZE
} from 'state/action-types';

export const directlyMiddleware = () => next => action => {
	const { questionText, name, email } = action;

	switch ( action.type ) {
		case DIRECTLY_ASK_QUESTION:
			directly.askQuestion( { questionText, name, email } );
			break;
		case DIRECTLY_INITIALIZE:
			directly.initialize( {}, ( error ) => {
				if ( error ) {
					// TODO: Do something if there's an error
				}
			} );
			break;
	}

	return next( action );
};

export default directlyMiddleware;
