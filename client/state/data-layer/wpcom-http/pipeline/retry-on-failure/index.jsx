/**
 * External dependencies
 */
import { get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import {
	buildKey,
	isGetRequest,
} from '../utils';

import {
	basicJitter,
	decorrelatedJitter,
} from './delays';
import defaultPolicy from './policies';

const retryCounts = new Map();

/**
 * Empties the retryCounts
 *
 * FOR TESTING ONLY!
 */
export const clearCounts = () => {
	if ( 'undefined' !== typeof window ) {
		throw new Error( '`clearCounts()` is not for use in production - only in testing!' );
	}

	retryCounts.clear();
};

export const retryOnFailure = inboundData => {
	const {
		nextError,
		nextRequest,
		originalRequest,
		store,
	} = inboundData;

	const key = buildKey( nextRequest );
	const retryCount = retryCounts.get( key ) || 0;

	// if we need to keep this in the queue
	// we will resubmit it with new data
	retryCounts.delete( key );

	// if the request came back successfully
	// then we have no need to intercept it
	// flush our records of it
	if ( ! nextError ) {
		return inboundData;
	}

	// otherwise check if we should try again

	if ( ! isGetRequest( nextRequest ) ) {
		return inboundData;
	}

	const { options: { whenFailing: policy = defaultPolicy } = {} } = nextRequest;
	const { delay: rawDelay, maxTries, name } = policy;

	if ( 'NO_RETRY' === name || retryCount > maxTries ) {
		return inboundData;
	}

	const delay = get( {
		SIMPLE_RETRY: basicJitter,
		EXPONENTIAL_BACKOFF: decorrelatedJitter,
	}, name, identity )( rawDelay, retryCount );

	setTimeout( () => store.dispatch( originalRequest ), delay );
	retryCounts.set( key, retryCount + 1 );

	return { ...inboundData, shouldAbort: true };
};
