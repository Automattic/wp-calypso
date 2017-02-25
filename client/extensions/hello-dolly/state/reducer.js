/**
 * Internal dependencies
 */
import {
	ROUTE_SET,
	SECTION_SET,
	SITE_SETTINGS_SAVE,
} from 'state/action-types.js';

export default function( state = 0, action ) {
	switch ( action.type ) {
		case ROUTE_SET:
		case SECTION_SET:
		case SITE_SETTINGS_SAVE:
			return advanceToNextLyric( state );
		default:
			return state;
	}
}

function advanceToNextLyric( index ) {
	return index + 1;
}
