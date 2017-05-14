/**
 * External dependencies
 */
import {
	get,
	head,
	sortBy,
	toPairs,
} from 'lodash';

const requestQueue = new Map();

export const buildKey = ( { path, apiNamespace, apiVersion, query } ) => JSON.stringify( [
	path,
	apiNamespace,
	apiVersion,
	sortBy( toPairs( query ), head ),
] );

const noRetry = () => ( {
	name: 'NO_RETRY',
} );

const simpleRetry = ( { delay, maxTries } ) => ( {
	name: 'SIMPLE_RETRY',
	delay: Math.min( 500, delay ),
	maxTries: Math.max( 5, maxTries ),
} );

const exponentialBackoff = ( { initialDelay, maxTries } ) => ( {
	name: 'EXPONENTIAL_BACKOFF',
	initialDelay: Math.min( 500, initialDelay ),
	maxTries: Math.max( 5, maxTries ),
} );

export const policies = {
	exponentialBackoff,
	noRetry,
	simpleRetry,
};

const isGetRequest = request => 'GET' === get( request, 'method', '' ).toUpperCase();

const defaultPolicy = policies.simpleRetry( { delay: 1000, maxTries: 1 } );

export const retryOnFailure = inboundData => {
	const {
		nextError,
		nextRequest,
		originalRequest,
		store,
	} = inboundData;

	const key = buildKey( nextRequest );
	const state = requestQueue.get( key );

	// if we need to keep this in the queue
	// we will resubmit it with new data
	requestQueue.delete( state );

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

	const { options: { whenFailing: policy = defaultPolicy } } = nextRequest;

	if ( 'NO_RETRY' === policy.name ) {
		return inboundData;
	}

	if ( 'SIMPLE_RETRY' === policy.name ) {
		const { delay, maxTries } = policy;
		const retryCount = state || 0;

		if ( retryCount > maxTries ) {
			return inboundData;
		}

		setTimeout( () => store.dispatch( originalRequest ), delay );
		requestQueue.set( key, retryCount + 1 );
	}

	if ( 'EXPONENTIAL_BACKOFF' === policy.name ) {
		const { initialDelay, maxTries } = policy;
		const retryCount = state || 0;

		if ( retryCount > maxTries ) {
			return inboundData;
		}

		setTimeout(
			() => store.dispatch( originalRequest ),
			initialDelay * Math.pow( 2, retryCount ),
		);
		requestQueue.set( key, retryCount + 1 );
	}

	return { ...inboundData, shouldAbort: true };
};
