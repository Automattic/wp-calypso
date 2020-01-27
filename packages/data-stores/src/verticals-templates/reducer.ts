/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Template } from './types';

function templates(
	state: Record< string, Template[] | undefined > = {},
	action: import('./actions').Action
) {
	if ( action.type === 'RECEIVE_TEMPLATES' ) {
		return {
			...state,
			[ action.verticalId ]: action.templates,
		};
	}
	return state;
}

const reducer = combineReducers( { templates } );

export type State = ReturnType< typeof reducer >;

export default reducer;
