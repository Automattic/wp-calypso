/**
 * External dependencies
 */
import { findIndex, pick, reject } from 'lodash';

import update from 'react-addons-update';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import { addMissingWpcomRecords, removeDuplicateWpcomRecords } from './';

function updateDomainState( state, domainName, dns ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || getInitialStateForDomain(), dns )
		}
	};

	return update( state, command );
}

function addDns( state, domainName, record ) {
	const newRecord = Object.assign( {}, record, {
		isBeingAdded: true
	} );

	return update( state, {
		[ domainName ]: {
			isSubmittingForm: { $set: true },
			records: {
				$apply: ( records ) => {
					const added = records.concat( [ newRecord ] );
					return removeDuplicateWpcomRecords( domainName, added );
				}
			}
		}
	} );
}

function deleteDns( state, domainName, record ) {
	const index = findDnsIndex( state[ domainName ].records, record );

	if ( index === -1 ) {
		return state;
	}

	const command = {
		[ domainName ]: {
			records: {
				$apply: ( records ) => {
					const deleted = reject( records, ( _, current ) => {
						return index === current;
					} );

					return addMissingWpcomRecords( domainName, deleted );
				}
			}
		}
	};

	return update( state, command );
}

function updateDnsState( state, domainName, record, updatedFields ) {
	const index = findDnsIndex( state[ domainName ].records, record ),
		updatedRecord = Object.assign( {}, record, updatedFields );

	if ( index === -1 ) {
		return state;
	}

	const command = {
		[ domainName ]: {
			records: {
				[ index ]: {
					$merge: updatedRecord
				}
			}
		}
	};

	return update( state, command );
}

function findDnsIndex( records, record ) {
	const matchingFields = pick( record, [ 'id', 'data', 'name', 'type' ] );
	return findIndex( records, matchingFields );
}

function getInitialStateForDomain() {
	return {
		isFetching: false,
		hasLoadedFromServer: false,
		isSubmittingForm: false,
		records: null
	};
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.DNS_FETCH:
			state = updateDomainState( state, action.domainName, {
				isFetching: true
			} );
			break;
		case ActionTypes.DNS_FETCH_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				records: action.records,
				isFetching: false,
				hasLoadedFromServer: true
			} );
			break;
		case ActionTypes.DNS_FETCH_FAILED:
			state = updateDomainState( state, action.domainName, {
				isFetching: false
			} );
			break;
		case ActionTypes.DNS_ADD:
			state = addDns( state, action.domainName, action.record );
			break;
		case ActionTypes.DNS_ADD_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: false
			} );
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingAdded: false
			} );
			break;
		case ActionTypes.DNS_APPLY_TEMPLATE_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				records: action.records,
				isFetching: false,
				hasLoadedFromServer: true
			} );
			break;
		case ActionTypes.DNS_ADD_FAILED:
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: false
			} );
			state = deleteDns( state, action.domainName, action.record );
			break;
		case ActionTypes.DNS_DELETE:
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingDeleted: true
			} );
			break;
		case ActionTypes.DNS_DELETE_COMPLETED:
			state = deleteDns( state, action.domainName, action.record );
			break;
		case ActionTypes.DNS_DELETE_FAILED:
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingDeleted: false
			} );
			break;
	}

	return state;
}

export {
	getInitialStateForDomain,
	reducer
};
