/**
 * External dependencies
 */
import refx from 'refx';

/**
 * Internal dependencies
 */
import preferenceEffects from './preferences/effects';

/**
 * Applies the custom middlewares used specifically in the editor module.
 *
 * @param {Object} store Store Object.
 *
 * @return {Object} Update Store Object.
 */
function applyMiddlewares( store ) {
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

	enhancedDispatch = refx( { ...preferenceEffects } )( middlewareAPI )( store.dispatch );

	store.dispatch = enhancedDispatch;
	return store;
}

export default applyMiddlewares;
