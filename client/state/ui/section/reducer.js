import { SECTION_SET, SECTION_NAME_SET } from 'calypso/state/action-types';

//TODO: do we really want to mix strings and booleans?
export function section( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return action.section !== undefined ? action.section : state;
	}
	return state;
}

export function sectionName( state = null, action ) {
	switch ( action.type ) {
		case SECTION_NAME_SET:
			return action.sectionName || state;
	}
	return state;
}
