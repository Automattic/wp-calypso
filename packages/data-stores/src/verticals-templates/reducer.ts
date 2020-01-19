/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, Template, VerticalsTemplatesAction } from './types';

function templates(
	state: Record< string, Template[] | undefined > = {},
	action: VerticalsTemplatesAction
) {
	if ( action.type === ActionType.RECEIVE_TEMPLATES ) {
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
