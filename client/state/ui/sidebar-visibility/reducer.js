/**
 * Internal dependencies
 */

import { SIDEBAR_TOGGLE_VISIBILITY } from 'state/action-types';

/**
 * Tracks if the sidebar is collapsed
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */

export default ( state = false, { type, sidebarIsCollapsed } ) => {
	switch ( type ) {
		case SIDEBAR_TOGGLE_VISIBILITY:
			return sidebarIsCollapsed;
	}
	return state;
};
