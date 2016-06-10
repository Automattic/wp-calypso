/**
 * External dependencies
 */
import noop from 'lodash/noop';

const WAIT_INITIAL = 1; // initial wait in milliseconds
const WAIT_MULTIPLIER = 2;
const WAIT_MAX = 2048; // give up waiting when delay has grown to ~4 seconds

function wait( { condition, consequence, delay = 0 } ) {
	return new Promise( ( resolve, reject ) => {
		const waitLoop = ( options ) => {
			console.log( 'in loop, checking for ', options.condition, 'delay', options.delay );
			if ( options.condition() ) {
				//console.log( 'resolving as true ', args.condition );
				resolve( true );
				return;
			}

			if ( options.delay >= WAIT_MAX ) {
				reject();
				return;
			}

			setTimeout( waitLoop.bind( null, {
				condition: options.condition,
				consequence: options.consequence,
				delay: options.delay ? options.delay * WAIT_MULTIPLIER : WAIT_INITIAL,
			} ), options.delay );
		};

		waitLoop( { condition, consequence, delay } );
	} );
}

export default wait;
