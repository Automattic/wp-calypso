/**
 * External dependencies
 */

import { compact, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { applyDuplicatesHandlers, removeDuplicateGets } from './remove-duplicate-gets';
import { retryOnFailure } from './retry-on-failure';

/**
 * @typedef {object} InboundData
 * @property {object} originalRequest the Redux action describing the inbound request
 * @property {ReduxStore} store Redux store
 * @property {*} originalData response data from returned network request
 * @property {*} originalError response error from returned network request
 * @property {*} originalHeaders response headers from returned network request
 * @property {*} nextData transformed response data
 * @property {*} nextError transformed response error
 * @property {*} nextHeaders transformed repsonse headers
 * @property {object[]} failures list of `onFailure` actions to dispatch
 * @property {object[]} successes list of `onSuccess` actions to dispatch
 * @property {boolean} [shouldAbort] whether or not no further processing should occur for request
 */

/**
 * @typedef {Function} InboundProcessor
 * @param {InboundData} information about request response at this stage in the pipeline
 * @returns {InboundData} contains transformed responder actions
 */

/**
 * @typedef {object} OutboundData
 * @property {object} originalRequest the Redux action describing the outbound request
 * @property {ReduxStore} store Redux store
 * @property {?object} nextRequest the processed request to pass along the chain
 */

/**
 * @typedef {Function} OutboundProcessor
 * @param {OutboundData} information about request at this stage in the pipeline
 * @returns {OutboundData} contains transformed nextRequest
 */

/** @type {InboundProcessor[]} */
const inboundChain = [ retryOnFailure(), applyDuplicatesHandlers ];

/** @type {OutboundProcessor[]} */
const outboundChain = [ removeDuplicateGets ];

const applyInboundProcessor = ( inboundData, nextProcessor ) =>
	inboundData.shouldAbort !== true ? nextProcessor( inboundData ) : inboundData;

const applyOutboundProcessor = ( outboundData, nextProcessor ) =>
	outboundData.nextRequest !== null ? nextProcessor( outboundData ) : outboundData;

export const processInboundChain = ( chain ) => (
	originalRequest,
	store,
	originalData,
	originalError,
	originalHeaders
) =>
	pick(
		chain.reduce( applyInboundProcessor, {
			originalRequest,
			store,
			originalData,
			originalError,
			originalHeaders,
			nextData: originalData,
			nextError: originalError,
			nextHeaders: originalHeaders,
			failures: compact( [ originalRequest.onFailure ] ),
			successes: compact( [ originalRequest.onSuccess ] ),
		} ),
		[ 'failures', 'nextData', 'nextError', 'nextHeaders', 'successes', 'shouldAbort' ]
	);

export const processOutboundChain = ( chain ) => ( originalRequest, store ) =>
	chain.reduce( applyOutboundProcessor, { originalRequest, store, nextRequest: originalRequest } )
		.nextRequest;

export const processInbound = processInboundChain( inboundChain );

export const processOutbound = processOutboundChain( outboundChain );
