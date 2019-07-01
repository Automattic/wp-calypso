/** @format */

/**
 * Internal dependencies
 */

import {
	MY_SITES_SIDEBAR_SECTION_TOGGLE,
	MY_SITES_SIDEBAR_SECTION_EXPAND,
	MY_SITES_SIDEBAR_SECTION_COLLAPSE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

function expansionReducer( state = false, action ) {
	switch ( action.type ) {
		case MY_SITES_SIDEBAR_SECTION_TOGGLE:
			return ! state;
		case MY_SITES_SIDEBAR_SECTION_EXPAND:
			return true;
		case MY_SITES_SIDEBAR_SECTION_COLLAPSE:
			return false;
		default:
			return state;
	}
}

expansionReducer.schema = {
	type: 'boolean',
};

const sectionReducer = combineReducers( { isOpen: expansionReducer } );

export default keyedReducer( 'sidebarSection', sectionReducer );
