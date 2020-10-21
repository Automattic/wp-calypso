/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import sidebar from './sidebar/reducer';

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

export default combineReducers( {
	sidebarSections: withSchemaValidation( schema, sidebar ),
} );
