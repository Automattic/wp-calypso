/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import sidebar from './sidebar/reducer';
import { MY_SITES_SIDEBAR_SECTIONS_COLLAPSE_ALL } from 'calypso/state/action-types';

const schema = {
	type: 'object',
	patternProperties: {
		// Sidebar section key, e.g. `site`.
		'^\\w+$': {
			type: 'object',
		},
	},
	additionalProperties: false,
};

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

export default combineReducers( {
	sidebarSections: withSchemaValidation( schema, withAllSectionsSidebarControls( sidebar ) ),
} );
