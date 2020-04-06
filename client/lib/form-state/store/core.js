/**
 * Internal dependencies
 */

import formState from '../';

const { changeFieldValue } = formState;

function core() {
	return {
		handleFieldChange( { name, value } ) {
			return { type: 'FIELD_CHANGE', name, value };
		},

		reduce( state, action ) {
			let next;

			switch ( action.type ) {
				case 'FIELD_CHANGE':
					next = changeFieldValue( state, action.name, action.value, false );
					break;

				default:
					next = state;
			}

			return next;
		},
	};
}

export default core;
