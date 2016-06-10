/**
 * External dependencies
 */
import noop from 'lodash/noop';

const WAIT_INITIAL = 1; // initial wait in milliseconds
const WAIT_MULTIPLIER = 2;
const WAIT_MAX = 2048; // give up waiting when delay has grown to ~4 seconds

function wait( { condition, consequence, delay = 0, onError = noop } ) {
	return new Promise( ( resolve, reject ) => {
		const waitLoop = () => {
			if ( condition() ) {
				resolve();
			}

			if ( delay >= WAIT_MAX ) {
				reject();
				return;
			}
		};

		setTimeout( waitLoop.bind( null, {
			condition,
			consequence,
			delay: delay ? delay * WAIT_MULTIPLIER : WAIT_INITIAL,
			onError,
		} ), delay );
	} );
}

export default wait;
