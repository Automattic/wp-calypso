/**
 * External dependencies
 */
import escapeRegExp from 'lodash/string/escapeRegExp';
import findIndex from 'lodash/array/findIndex';
import isUndefined from 'lodash/lang/isUndefined';
import update from 'react-addons-update';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';

function updateDomainState( state, domainName, dns ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || getInitialStateForDomain(), dns )
		}
	};

	return update( state, command );
}

function addDns( state, domainName, record ) {
	const domainSuffix = new RegExp( '\\.' + escapeRegExp( domainName ) + '\\.$' ),
		newRecord = Object.assign( {}, record, {
			name: record.name.replace( domainSuffix, '' )
		} );

	return update( state, {
		[ domainName ]: {
			records: { $push: [ newRecord ] },
			isSubmittingForm: { $set: false }
		}
	} );
}

function deleteDns( state, domainName, record ) {
	const index = findDnsIndex( state[ domainName ].records, record );

	if ( index === -1 ) {
		return state;
	}

	const command = {
		[ domainName ]: { records: { $splice: [ [ index, 1 ] ] } }
	};

	return update( state, command );
}

function markDnsForDeletion( state, domainName, record, { isBeingDeleted } ) {
	const index = findDnsIndex( state[ domainName ].records, record ),
		updatedRecord = Object.assign( {}, record, {
			isBeingDeleted,
		} );

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

function findDnsIndex( records, { id, data, name, type } ) {
	const matchingFields = isUndefined( id ) ? { data, name, type } : { id, data, name, type };
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
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: true
			} );
			break;
		case ActionTypes.DNS_ADD_COMPLETED:
			state = addDns( state, action.domainName, action.record );
			break;
		case ActionTypes.DNS_ADD_FAILED:
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: false
			} );
			break;
		case ActionTypes.DNS_DELETE:
			state = markDnsForDeletion( state, action.domainName, action.record, {
				isBeingDeleted: true
			} );
			break;
		case ActionTypes.DNS_DELETE_COMPLETED:
			state = deleteDns( state, action.domainName, action.record );
			break;
		case ActionTypes.DNS_DELETE_FAILED:
			state = markDnsForDeletion( state, action.domainName, action.record, {
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
