/**
 * External dependencies
 */
import { has, invoke, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { mergeHandlers } from '../data-layer/utils'; // FIXME: Move to this directory?
import { middleware as wpcomApiMiddleware } from '../data-layer/wpcom-api-middleware';

const MIDDLEWARES = {
	wpcomApi: wpcomApiMiddleware
};

const configuration = mapValues( MIDDLEWARES, mw =>
	configureMiddleware( mw, Object.create( null ), Object.create( null ) )
);

/**
 * Changes configuration to build middleware from new handlers.
 *
 * @param {string} middlewareName The name of the middleware.
 * @param {object} handlers The mapping of extension names to sets of handlers.
 * @param {object} config The config to be modified (defaults to module instance)
 * @returns {object} The config that was given, with modifications.
 */
export function configureMiddleware( middlewareName, handlers, config = configuration[ middlewareName ] ) {
	config.handlers = handlers;
	config.middleware = buildMiddleware( middlewareName, handlers );
	return config;
}

/**
 * Adds an extension's handlers to a given middleware.
 *
 * @param {string} middlewareName The name of the middleware.
 * @param {string} name The name of the extension.
 * @param {object} handlers A mapping of action types to arrays of handlers.
 * @param {object} config The config to be modified (defaults to module instance)
 * @return {boolean} True upon success, false if name is already taken.
 */
export function addHandlers( middlewareName, name, handlers, config = configuration[ middlewareName ] ) {
	if ( config.handlers && undefined !== config.handlers[ name ] ) {
		return false;
	}

	configureMiddleware( middlewareName, { ...config.handlers, [ name ]: handlers }, config );
	return true;
}

/**
 * Removes an extension's handlers from a given middleware.
 *
 * @param {string} middlewareName The name of the middleware.
 * @param {string} name The name of the extension.
 * @param {object} config The config to be modified (defaults to module instance)
 * @return {boolean} True upon success, false if name not found.
 */
export function removeHandlers( middlewareName, name, config = configuration[ middlewareName ] ) {
	const { [ name ]: omitted, ...remainingHandlers } = config.handlers || {};

	return Boolean( omitted && configureMiddleware( middlewareName, remainingHandlers, config ) );
}

export function buildMiddleware( middlewareName, handlersByExtension ) {
	const allHandlers = Object.values( handlersByExtension ).reduce( mergeHandlers, Object.create( null ) );

	if ( has( MIDDLEWARES, middlewareName ) ) {
		return invoke( MIDDLEWARES, middlewareName, allHandlers );
	}
}

/**
 * Extensions Middleware
 */
export default configuration.middleware;
