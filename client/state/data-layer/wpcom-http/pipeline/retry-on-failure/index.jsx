/**
 * External dependencies
 */
import { get, identity, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { isGetRequest } from '../utils';

import {
	basicJitter,
	decorrelatedJitter,
} from './delays';
import defaultPolicy from './policies';

const standardDelays = {
	SIMPLE_RETRY: basicJitter,
	EXPONENTIAL_BACKOFF: decorrelatedJitter,
};

const defaults = {
	getDelay: ( name, { delay, retryCount } ) => get( standardDelays, name, identity )( delay, retryCount ),
};

export const retryOnFailure = ( { getDelay } = defaults ) => inboundData => {
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

	const { options: { whenFailing: policy = defaultPolicy } = {} } = originalRequest;
	const { delay, maxAttempts, name } = policy;
	const retryCount = get( originalRequest, 'meta.dataLayer.retryCount', 0 ) + 1;

	if ( 'NO_RETRY' === name || retryCount > maxAttempts ) {
		return inboundData;
	}

	setTimeout(
		() => dispatch( merge( originalRequest, { meta: { dataLayer: { retryCount } } } ) ),
		getDelay( name, { delay, retryCount } )
	);

	return { ...inboundData, shouldAbort: true };
};
