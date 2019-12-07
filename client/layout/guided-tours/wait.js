/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

const WAIT_INITIAL = 1; // initial wait in milliseconds
const WAIT_MULTIPLIER = 2;
const WAIT_MAX = 2048; // give up waiting when delay has grown to ~4 seconds

const wait = ( { condition, consequence, delay = 0, onError = noop } ) => {
	if ( condition() ) {
		consequence();
		return;
	}

	if ( delay >= WAIT_MAX ) {
		onError();
		return;
	}

	window.setTimeout(
		wait.bind( null, {
			condition,
			consequence,
			delay: delay ? delay * WAIT_MULTIPLIER : WAIT_INITIAL,
			onError,
		} ),
		delay
	);
};

export default wait;
