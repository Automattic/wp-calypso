/**
 * Internal dependencies
 */

import FormStateStore from '../';

const { createInitialFormState, createNullFieldValues, initializeFields } = FormStateStore;

function asyncInitialize( { fieldNames, loadFunction } ) {
	return {
		initialize() {
			return ( dispatch ) => {
				dispatch( { type: 'INITIALIZE_START' } );

				loadFunction( ( error, fieldValues ) => {
					dispatch( {
						type: 'INITIALIZE_SUCCESS',
						fieldValues,
					} );
				} );
			};
		},

		reduce( state, action ) {
			let next;

			switch ( action.type ) {
				case 'INITIALIZE_START':
					next = createInitialFormState( createNullFieldValues( fieldNames ) );
					break;

				case 'INITIALIZE_SUCCESS':
					next = initializeFields( state, action.fieldValues );
					break;

				default:
					next = state;
			}

			return next;
		},
	};
}

export default asyncInitialize;
