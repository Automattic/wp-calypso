/**
 * External dependencies
 */
import update from 'react-addons-update';

/**
 * Internal dependencies
 */
import { action as UpgradesActionTypes } from 'lib/upgrades/constants';

const initialDomainState = {
	isFetching: false,
	hasLoadedFromServer: false,
	list: null
};

/**
 * @desc Updates name servers entry for given domain.
 *
 * @param {Object} [state] Current state.
 * @param {string} [domainName] Domain name.
 * @param {Object} [data] Domain name servers data.
 * @return {Object} New state
 */
function updateState( state, domainName, data ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || initialDomainState, data )
		}
	};

	return update( state, command );
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case UpgradesActionTypes.NAMESERVERS_FETCH:
			state = updateState( state, action.domainName, {
				isFetching: true
			} );
			break;
		case UpgradesActionTypes.NAMESERVERS_FETCH_FAILED:
			state = updateState( state, action.domainName, {
				isFetching: false
			} );
			break;
		case UpgradesActionTypes.NAMESERVERS_FETCH_COMPLETED:
			state = updateState( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers
			} );
			break;
		case UpgradesActionTypes.NAMESERVERS_UPDATE_COMPLETED:
			state = updateState( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.nameservers
			} );
			break;
	}

	return state;
}

export {
	initialDomainState,
	reducer
};
