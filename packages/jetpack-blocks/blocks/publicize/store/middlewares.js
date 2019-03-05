/**
 * External dependencies
 */
import refx from 'refx';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import effects from './effects';

/**
 * Applies the custom middlewares used specifically in the Publicize extension.
 *
 * @param {Object} store Store Object.
 *
 * @return {Object} Update Store Object.
 */
export default function applyMiddlewares( store ) {
	const middlewares = [ refx( effects ) ];

	let enhancedDispatch = () => {
		throw new Error(
			'Dispatching while constructing your middleware is not allowed. ' +
				'Other middleware would not be applied to this dispatch.'
		);
	};
	let chain = [];

	const middlewareAPI = {
		getState: store.getState,
		dispatch: ( ...args ) => enhancedDispatch( ...args ),
	};
	chain = middlewares.map( middleware => middleware( middlewareAPI ) );
	enhancedDispatch = flowRight( ...chain )( store.dispatch );

	store.dispatch = enhancedDispatch;

	return store;
}
