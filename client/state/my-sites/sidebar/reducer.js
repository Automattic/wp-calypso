/**
 * Internal dependencies
 */
import {
	MY_SITES_SIDEBAR_SECTION_TOGGLE,
	MY_SITES_SIDEBAR_SECTION_EXPAND,
	MY_SITES_SIDEBAR_SECTION_COLLAPSE,
} from 'state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'state/utils';

const schema = {
	type: 'boolean',
};

const expansionReducer = withSchemaValidation( schema, ( state = false, action ) => {
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
} );

const sectionReducer = combineReducers( { isOpen: expansionReducer } );

export default keyedReducer( 'sidebarSection', sectionReducer );
