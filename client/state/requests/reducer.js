/**
 * External dependencies
 */
import { filter, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { REQUEST_ADD, REQUEST_REMOVE, REQUEST_CLEAR } from 'state/action-types';
import { createReducer } from 'state/utils';

const reducer = createReducer( {}, {
	[ REQUEST_ADD ]: ( state, { payload: { uid, type, options, createdAt } } ) => {
		const optionsSerialization = JSON.stringify( options );
		return {
			...state,
			[ uid ]: [
				...( state[ uid ] ? state[ uid ] : [] ),
				{ type, options: optionsSerialization, createdAt }
			]
		};
	},
	[ REQUEST_REMOVE ]: ( state, { payload: { uid, type, options } } ) => {
		const optionsSerialization = JSON.stringify( options );
		return {
			...state,
			[ uid ]: filter( state[ uid ], request => {
				return request.type !== type || request.options !== optionsSerialization;
			} )
		};
	},
	[ REQUEST_CLEAR ]: ( state, { payload: uid } ) => {
		return omit( state, [ uid ] );
	}
} );

export default reducer;
