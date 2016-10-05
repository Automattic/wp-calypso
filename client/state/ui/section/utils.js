/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { SECTION_SET } from 'state/action-types';

/**
 * Given an initial state and section object key to manage, returns a reducer
 * function which manages state for the section key.
 *
 * @param  {*}        initialState Initial state value
 * @param  {String}   key          Section object key
 * @return {Function}              Section reducer
 */
export function createSectionReducer( initialState, key ) {
	return createReducer( initialState, {
		[ SECTION_SET ]: ( state, { section } ) => {
			if ( section && section.hasOwnProperty( key ) ) {
				return section[ key ];
			}

			return state;
		}
	} );
}
