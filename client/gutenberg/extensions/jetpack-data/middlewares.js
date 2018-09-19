/** @format */

/**
 * External dependencies
 */
import refx from 'refx';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import * as effects from './effects';

export default function applyMiddlewares( store ) {
	const middlewares = [ refx( effects ) ];

	let enhancedDispatch = () => {
		throw new Error(
			'Dispatching while constructing your middleware is not allowed. ' +
				'Other middleware would not be applied to this dispatch.'
		);
	};

	const middlewareAPI = {
		getState: store.getState,
		dispatch: ( ...args ) => enhancedDispatch( ...args ),
	};

	const chain = middlewares.map( middleware => middleware( middlewareAPI ) );
	enhancedDispatch = flowRight( ...chain )( store.dispatch );

	store.dispatch = enhancedDispatch;

	return store;
}
