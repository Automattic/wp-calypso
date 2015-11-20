/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';

function updateState( state, domainName, users ) {
	const command = state[ domainName ] ? '$merge' : '$set';

	return React.addons.update( state, {
		[ domainName ]: {
			[ command ]: users
		}
	} );
}

function getInitialStateForDomain() {
	return {
		hasLoadedFromServer: false,
		value: null
	};
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.RECEIVE_GOOGLE_APPS_USERS:
			state = updateState( state, action.domainName, {
				hasLoadedFromServer: true,
				value: action.users
			} );
			break;
	}

	return state;
}

export {
	getInitialStateForDomain,
	reducer
};
