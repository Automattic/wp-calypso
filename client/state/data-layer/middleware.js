/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import { middleware } from './wpcom-api-middleware';

const configuration = configureMiddleware( Object.create( null ), Object.create( null ) );

/**
 * Changes configuration to build middleware from new handlers.
 *
 * @param {object} handlers The mapping of extension names to sets of handlers.
 * @param {object} config The config to be modified (defaults to module instance)
 * @returns {object} The config that was given, with modifications.
 */
export function configureMiddleware( handlers, config = configuration ) {
	config.handlers = handlers;
	config.middleware = buildMiddleware( handlers );
	if ( config.store && config.next ) {
		config.handleAction = config.middleware( config.store )( config.next );
	}
	return config;
}

/**
 * Adds an extension's handlers to the middleware.
 *
 * @param {string} name The name of the extension.
 * @param {object} handlers A mapping of action types to arrays of handlers.
 * @param {object} config The config to be modified (defaults to module instance)
 * @return {boolean} True upon success, false if name is already taken.
 */
export function addExtensionHandlers( name, handlers, config = configuration ) {
	if ( config.handlers && undefined !== config.handlers[ name ] ) {
		return false;
	}

	configureMiddleware( { ...config.handlers, [ name ]: handlers }, config );
	return true;
}

/**
 * Removes an extension's handlers from the middleware.
 *
 * @param {string} name The name of the extension.
 * @param {object} config The config to be modified (defaults to module instance)
 * @return {boolean} True upon success, false if name not found.
 */
export function removeExtensionHandlers( name, config = configuration ) {
	const { [ name ]: omitted, ...remainingHandlers } = config.handlers || {};

	return Boolean( omitted && configureMiddleware( remainingHandlers, config ) );
}

/**
 * Add additional handlers from state/data-layer/ to the middleware. It cannot be removed.
 *
 * @param {object} handlers A mapping of action types to arrays of handlers.
 * @param {object} config The config to be modified (defaults to module instance)
 */
export function addCoreHandlers( handlers, config = configuration ) {
	const core = mergeHandlers( ( config.handlers && config.handlers.core ) || {}, handlers );

	configureMiddleware( { ...config.handlers, core }, config );
}

export function buildMiddleware( handlersByExtension ) {
	const allHandlers = mergeHandlers( ...Object.values( handlersByExtension ) ) || [];

	return middleware( allHandlers );
}

/**
 * Extensions Middleware
 *
 * @param {object} store Redux store
 * @return {function} middleware
 */
export default store => next => {
	configuration.store = store;
	configuration.next = next;

	// Re-generate configuration.handleAction.
	configureMiddleware( configuration.handlers, configuration );

	return action => {
		return configuration.handleAction( action );
	};
};
