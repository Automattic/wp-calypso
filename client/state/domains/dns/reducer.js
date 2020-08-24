/**
 * External dependencies
 */
import {
	filter,
	find,
	findIndex,
	matches,
	negate,
	pick,
	reject,
	some,
	startsWith,
	without,
} from 'lodash';
import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import {
	DOMAINS_DNS_ADD,
	DOMAINS_DNS_ADD_COMPLETED,
	DOMAINS_DNS_ADD_FAILED,
	DOMAINS_DNS_APPLY_TEMPLATE_COMPLETED,
	DOMAINS_DNS_DELETE,
	DOMAINS_DNS_DELETE_COMPLETED,
	DOMAINS_DNS_DELETE_FAILED,
	DOMAINS_DNS_FETCH,
	DOMAINS_DNS_FETCH_COMPLETED,
	DOMAINS_DNS_FETCH_FAILED,
} from 'state/action-types';

function isWpcomRecord( record ) {
	return startsWith( record.id, 'wpcom:' );
}

function isRootARecord( domain ) {
	return matches( { type: 'A', name: `${ domain }.` } );
}

function isNsRecord( domain ) {
	return matches( { type: 'NS', name: `${ domain }.` } );
}

function removeDuplicateWpcomRecords( domain, records ) {
	const rootARecords = filter( records, isRootARecord( domain ) );
	const wpcomARecord = find( rootARecords, isWpcomRecord );
	const customARecord = find( rootARecords, negate( isWpcomRecord ) );

	if ( wpcomARecord && customARecord ) {
		return without( records, wpcomARecord );
	}

	return records;
}

function addMissingWpcomRecords( domain, records ) {
	let newRecords = records;

	if ( ! some( records, isRootARecord( domain ) ) ) {
		const defaultRootARecord = {
			domain,
			id: `wpcom:A:${ domain }.:${ domain }`,
			name: `${ domain }.`,
			protected_field: true,
			type: 'A',
		};

		newRecords = newRecords.concat( [ defaultRootARecord ] );
	}

	if ( ! some( records, isNsRecord( domain ) ) ) {
		const defaultNsRecord = {
			domain,
			id: `wpcom:NS:${ domain }.:${ domain }`,
			name: `${ domain }.`,
			protected_field: true,
			type: 'NS',
		};

		newRecords = newRecords.concat( [ defaultNsRecord ] );
	}

	return newRecords;
}

export const initialState = {
	isFetching: false,
	hasLoadedFromServer: false,
	isSubmittingForm: false,
	records: null,
};

function updateDomainState( state, domainName, dns ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || initialState, dns ),
		},
	};

	return update( state, command );
}

function addDns( state, domainName, record ) {
	const newRecord = Object.assign( {}, record, {
		isBeingAdded: true,
	} );

	return update( state, {
		[ domainName ]: {
			isSubmittingForm: { $set: true },
			records: {
				$apply: ( records ) => {
					const added = records.concat( [ newRecord ] );
					return removeDuplicateWpcomRecords( domainName, added );
				},
			},
		},
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
				},
			},
		},
	};

	return update( state, command );
}

function updateDnsState( state, domainName, record, updatedFields ) {
	const index = findDnsIndex( state[ domainName ].records, record );
	const updatedRecord = Object.assign( {}, record, updatedFields );

	if ( index === -1 ) {
		return state;
	}

	const command = {
		[ domainName ]: {
			records: {
				[ index ]: {
					$merge: updatedRecord,
				},
			},
		},
	};

	return update( state, command );
}

function findDnsIndex( records, record ) {
	const matchingFields = pick( record, [ 'id', 'data', 'name', 'type' ] );
	return findIndex( records, matchingFields );
}

export default function reducer( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_DNS_FETCH:
			state = updateDomainState( state, action.domainName, {
				isFetching: true,
			} );
			break;
		case DOMAINS_DNS_FETCH_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				records: action.records,
				isFetching: false,
				hasLoadedFromServer: true,
			} );
			break;
		case DOMAINS_DNS_FETCH_FAILED:
			state = updateDomainState( state, action.domainName, {
				isFetching: false,
			} );
			break;
		case DOMAINS_DNS_ADD:
			state = addDns( state, action.domainName, action.record );
			break;
		case DOMAINS_DNS_ADD_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: false,
			} );
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingAdded: false,
			} );
			break;
		case DOMAINS_DNS_APPLY_TEMPLATE_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				records: action.records,
				isFetching: false,
				hasLoadedFromServer: true,
			} );
			break;
		case DOMAINS_DNS_ADD_FAILED:
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: false,
			} );
			state = deleteDns( state, action.domainName, action.record );
			break;
		case DOMAINS_DNS_DELETE:
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingDeleted: true,
			} );
			break;
		case DOMAINS_DNS_DELETE_COMPLETED:
			state = deleteDns( state, action.domainName, action.record );
			break;
		case DOMAINS_DNS_DELETE_FAILED:
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingDeleted: false,
			} );
			break;
	}

	return state;
}
