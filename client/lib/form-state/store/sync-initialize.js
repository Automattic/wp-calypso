/**
 * External dependencies
 */

import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import FormStateStore from '../';

const { createInitialFormState, createNullFieldValues, initializeFields } = FormStateStore;

function syncInitialize( { fieldNames } ) {
	return {
		initialize() {
			return { type: 'INITIALIZE' };
		},

		reduce( state, action ) {
			let next;

			switch ( action.type ) {
				case 'INITIALIZE':
					next = createNullFieldValues( fieldNames );
					next = createInitialFormState( next );
					next = initializeFields(
						next,
						mapValues( fieldNames, () => '' )
					);
					break;

				default:
					next = state;
			}

			return next;
		},
	};
}

export default syncInitialize;
