/**
 * External dependencies
 */
import {
	compact,
	pick,
} from 'lodash';

/**
 * Internal dependencies
 */
import { applyDuplicatesHandlers, removeDuplicateGets } from './remove-duplicate-gets';

/**
 * @typedef {Object} EgressData
 * @property {Object} originalRequest the Redux action describing the egressing request
 * @property {ReduxStore} store Redux store
 * @property {*} originalData response data from returned network request
 * @property {*} originalError response error from returned network request
 * @property {*} nextData transformed response data
 * @property {*} nextError transformed response error
 * @property {Object[]} failures list of `onFailure` actions to dispatch
 * @property {Object[]} successes list of `onSuccess` actions to dispatch
 * @property {Boolean} [shouldAbort] whether or not no further processing should occur for request
 */

/**
 * @typedef {Function} EgressProcessor
 * @param {EgressData} information about request response at this stage in the pipeline
 * @returns {EgressData} contains transformed responder actions
 */

/**
 * @typedef {Object} IngressData
 * @property {Object} originalRequest the Redux action describing the ingressing request
 * @property {ReduxStore} store Redux store
 * @property {?Object} nextRequest the processed request to pass along the chain
 */

/**
 * @typedef {Function} IngressProcessor
 * @param {IngressData} information about request at this stage in the pipeline
 * @returns {IngressData} contains transformed nextRequest
 */

/** @type {EgressProcessor[]} */
const egressChain = [
	applyDuplicatesHandlers,
];

/** @type {IngressProcessor[]} */
const ingressChain = [
	removeDuplicateGets,
];

const applyIngressChain = ( ingressData, nextLink ) =>
	ingressData.nextRequest !== null
		? nextLink( ingressData )
		: ingressData;

const applyEgressChain = ( egressData, nextLink ) =>
	egressData.shouldAbort !== true
		? nextLink( egressData )
		: egressData;

export const processIngressChain = chain => ( originalRequest, store ) =>
	chain
		.reduce( applyIngressChain, { originalRequest, store, nextRequest: originalRequest } )
		.nextRequest;

export const processEgressChain = chain => ( originalRequest, store, originalData, originalError ) =>
	pick(
		chain.reduce( applyEgressChain, {
			originalRequest,
			store,
			originalData,
			originalError,
			nextData: originalData,
			nextError: originalError,
			failures: compact( [ originalRequest.onFailure ] ),
			successes: compact( [ originalRequest.onSuccess ] ),
		} ),
		[ 'failures', 'nextData', 'nextError', 'successes', 'shouldAbort' ],
	);

export const processIngress = processIngressChain( ingressChain );

export const processEgress = processEgressChain( egressChain );
