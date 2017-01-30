/**
 * External dependencies
 */
import { get } from 'lodash';

const requests = new Set();

const dedupeRequests = () => next => action => {
	const requestStart = get( action, [ 'meta', [ 'requestStart' ] ] );
	const requestEnd = get( action, [ 'meta', [ 'requestEnd' ] ] );

	// if there is no requestStart or requestEnd meta then it is not meant for this middleware
	if ( ! requestStart && ! requestEnd ) {
		next( action );
		return;
	}

	// if both exist throw an error.  a single action should not be ending and starting a request
	if ( requestStart && requestEnd ) {
		throw new Error( 'cannot start and end a request in the same action' );
	}

	if ( requestStart && requests.has( requestStart ) ) {
		// eat the action if a request is already in flight
		return;
	} else if ( requestStart ) {
		requests.add( requestStart );
	} else if ( requestEnd && requests.has( requestEnd ) ) {
		requests.delete( requestEnd );
	}
	next( action );
};

export default dedupeRequests();
