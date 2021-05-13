/**
 * Internal dependencies
 */
import {
	MY_SITES_SIDEBAR_SECTION_TOGGLE,
	MY_SITES_SIDEBAR_SECTION_EXPAND,
	MY_SITES_SIDEBAR_SECTION_COLLAPSE,
	MY_SITES_SIDEBAR_SECTIONS_COLLAPSE_ALL,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'calypso/state/utils';

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

/**
 * Higher-order reducer to enable expanding/collapsing of all
 * the sidebar sections via a single action.
 *
 * @param reducer Function the keyed reducer to be enhanced
 */
const withAllSectionsSidebarControls = ( reducer ) => ( state, action ) => {
	switch ( action.type ) {
		case MY_SITES_SIDEBAR_SECTIONS_COLLAPSE_ALL:
			return Object.keys( state ).reduce( ( acc, curr ) => {
				acc[ curr ] = {
					...state[ curr ],
					isOpen: false,
				};

				return acc;
			}, {} );
		default:
			// Call original section-specific keyed reducer
			return reducer( state, action );
	}
};

export default withAllSectionsSidebarControls( keyedReducer( 'sidebarSection', sectionReducer ) );
