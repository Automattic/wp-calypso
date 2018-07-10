/**
 * External dependencies
 */
import jQuery from 'jquery';

/**
 * Internal dependencies
 */
import createNonceMiddleware from './middlewares/nonce';
import createRootURLMiddleware from './middlewares/root-url';
import createPreloadingMiddleware from './middlewares/preloading';
import namespaceEndpointMiddleware from './middlewares/namespace-endpoint';
import httpV1Middleware from './middlewares/http-v1';

const middlewares = [];

function registerMiddleware( middleware ) {
	middlewares.push( middleware );
}

function apiRequest( options ) {
	const raw = ( nextOptions ) => jQuery.ajax( nextOptions );
	const steps = [
		...middlewares,
		namespaceEndpointMiddleware,
		httpV1Middleware,
		raw,
	].reverse();
	const next = ( nextOptions ) => {
		const nextMiddleware = steps.pop();
		return nextMiddleware( nextOptions, next );
	};

	return next( options );
}

apiRequest.use = registerMiddleware;

apiRequest.createNonceMiddleware = createNonceMiddleware;
apiRequest.createPreloadingMiddleware = createPreloadingMiddleware;
apiRequest.createRootURLMiddleware = createRootURLMiddleware;

export default apiRequest;
