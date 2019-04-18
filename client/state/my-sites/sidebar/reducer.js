/** @format */

/**
 * Internal dependencies
 */

import {
	MY_SITES_SIDEBAR_SITE_TOGGLE,
	MY_SITES_SIDEBAR_DESIGN_TOGGLE,
	MY_SITES_SIDEBAR_TOOLS_TOGGLE,
	MY_SITES_SIDEBAR_MANAGE_TOGGLE,
} from 'state/action-types';

import { combineReducers } from 'state/utils';

function createToggleReducer( type ) {
	const reducer = function( state = null, action ) {
		if ( type === action.type ) {
			return ! state;
		}

		return state;
	};

	reducer.schema = {
		type: 'boolean',
	};

	return reducer;
}

export default combineReducers( {
	isSiteOpen: createToggleReducer( MY_SITES_SIDEBAR_SITE_TOGGLE ),
	isDesignOpen: createToggleReducer( MY_SITES_SIDEBAR_DESIGN_TOGGLE ),
	isToolsOpen: createToggleReducer( MY_SITES_SIDEBAR_TOOLS_TOGGLE ),
	isManageOpen: createToggleReducer( MY_SITES_SIDEBAR_MANAGE_TOGGLE ),
} );
