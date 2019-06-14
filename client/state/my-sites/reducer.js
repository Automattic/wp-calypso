/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import sidebar from './sidebar/reducer';

sidebar.schema = {
	type: 'object',
	patternProperties: {
		// Sidebar section key, e.g. `site`.
		'^\\w+$': {
			type: 'object',
		},
	},
	additionalProperties: false,
};

export default combineReducers( { sidebarSections: sidebar } );
