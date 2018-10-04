/** @format */

/**
 * External dependencies
 */

import { get, merge } from 'lodash';
import { decorrelatedJitter as defaultDelay } from './delays';
import { default as defaultPolicy } from './policies';

const isGetRequest = request => 'GET' === get( request, 'method', '' ).toUpperCase();

export const retryOnFailure = ( getDelay = defaultDelay ) => inboundData => {
	const {
		nextError,
		originalRequest,
		store: { dispatch },
	} = inboundData;

	// if the request came back successfully
	// then we have no need to intercept it
	// flush our records of it
	if ( ! nextError ) {
		return inboundData;
	}

	// otherwise check if we should try again
	if ( ! isGetRequest( originalRequest ) ) {
		return inboundData;
	}

	const { options: { retryPolicy: policy = defaultPolicy } = {} } = originalRequest;
	const { delay, maxAttempts, name } = policy;
	const retryCount = get( originalRequest, 'meta.dataLayer.retryCount', 0 ) + 1;

	if ( 'NO_RETRY' === name || retryCount > maxAttempts ) {
		return inboundData;
	}

	setTimeout(
		() => dispatch( merge( originalRequest, { meta: { dataLayer: { retryCount } } } ) ),
		getDelay( delay, retryCount )
	);

	return { ...inboundData, shouldAbort: true };
};
