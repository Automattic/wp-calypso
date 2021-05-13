/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { SECTION_SET } from 'calypso/state/action-types';

export const upgradeIntent = withSchemaValidation( { type: 'string' }, ( state = '', action ) => {
	if ( action.type !== SECTION_SET ) {
		return state;
	}

	if ( action.isLoading || ! action.section?.name ) {
		// Leave the intent alone until the new section is fully loaded
		return state;
	}

	if ( [ 'checkout', 'checkout-thank-you', 'plans' ].includes( action.section.name ) ) {
		// Leave the intent alone for sections that should not clear it
		return state;
	}

	if ( [ 'plugins', 'themes', 'hosting' ].includes( action.section.name ) ) {
		return action.section.name;
	}

	// Clear the intent when any other section is loaded
	return '';
} );

export default combineReducers( {
	upgradeIntent,
} );
