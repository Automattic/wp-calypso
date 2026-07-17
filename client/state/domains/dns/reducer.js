import { pick } from '@automattic/js-utils';
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
	DOMAINS_DNS_UPDATE,
	DOMAINS_DNS_UPDATE_COMPLETED,
	DOMAINS_DNS_UPDATE_FAILED,
} from 'calypso/state/action-types';

function isWpcomRecord( record ) {
	return ( record.id ?? '' ).startsWith( 'wpcom:' );
}

function isRootARecord( domain ) {
	const name = `${ domain }.`;
	return ( record ) => record?.type === 'A' && record?.name === name;
}

function isRootAaaaRecord( domain ) {
	const name = `${ domain }.`;
	return ( record ) => record?.type === 'AAAA' && record?.name === name;
}

function isNsRecord( domain ) {
	const name = `${ domain }.`;
	return ( record ) => record?.type === 'NS' && record?.name === name;
}

function removeDuplicateWpcomRecords( domain, records ) {
	const rootARecords = records.filter( isRootARecord( domain ) );
	const wpcomARecord = rootARecords.find( isWpcomRecord );
	const customARecord = rootARecords.find( ( record ) => ! isWpcomRecord( record ) );
	const customRootAaaaRecords = records.filter( isRootAaaaRecord( domain ) );

	if ( wpcomARecord && ( customARecord || customRootAaaaRecords ) ) {
		return records.filter( ( record ) => record !== wpcomARecord );
	}

	return records;
}

function addMissingWpcomRecords( domain, records ) {
	let newRecords = records;

	if ( ! records.some( isRootARecord( domain ) ) ) {
		const defaultRootARecord = {
			domain,
			id: `wpcom:A:${ domain }.:${ domain }`,
			name: `${ domain }.`,
			protected_field: true,
			type: 'A',
		};

		newRecords = newRecords.concat( [ defaultRootARecord ] );
	}

	if ( ! records.some( isNsRecord( domain ) ) ) {
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
	return {
		...state,
		[ domainName ]: Object.assign( {}, state[ domainName ] || initialState, dns ),
	};
}

function addDns( state, domainName, record ) {
	const newRecord = Object.assign( {}, record, {
		isBeingAdded: true,
	} );

	const domainState = state[ domainName ];
	const added = domainState.records.concat( [ newRecord ] );

	return {
		...state,
		[ domainName ]: {
			...domainState,
			isSubmittingForm: true,
			records: removeDuplicateWpcomRecords( domainName, added ),
		},
	};
}

function deleteDns( state, domainName, record ) {
	const domainState = state[ domainName ];
	const index = findDnsIndex( domainState.records, record );

	if ( index === -1 ) {
		return state;
	}

	const deleted = domainState.records.filter( ( _, current ) => index !== current );

	return {
		...state,
		[ domainName ]: {
			...domainState,
			records: addMissingWpcomRecords( domainName, deleted ),
		},
	};
}

function updateDnsState( state, domainName, record, updatedFields ) {
	const domainState = state[ domainName ];
	const index = findDnsIndex( domainState.records, record );
	const updatedRecord = Object.assign( {}, record, updatedFields );

	if ( index === -1 ) {
		return state;
	}

	return {
		...state,
		[ domainName ]: {
			...domainState,
			records: domainState.records.map( ( currentRecord, currentIndex ) =>
				currentIndex === index ? { ...currentRecord, ...updatedRecord } : currentRecord
			),
		},
	};
}

function findDnsIndex( records, record ) {
	const matchingFields = Object.entries( pick( record, [ 'id', 'data', 'name', 'type' ] ) );
	return ( records ?? [] ).findIndex( ( r ) =>
		matchingFields.every( ( [ key, value ] ) => r[ key ] === value )
	);
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
				records: action.records,
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
			state = updateDomainState( state, action.domainName, { records: action.records } );
			break;
		case DOMAINS_DNS_DELETE_FAILED:
			state = updateDnsState( state, action.domainName, action.record, {
				isBeingDeleted: false,
			} );
			break;
		case DOMAINS_DNS_UPDATE:
			state = updateDomainState( state, action.domainName, {
				isSubmittingForm: true,
				isFetching: true,
			} );
			break;
		case DOMAINS_DNS_UPDATE_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				records: action.records,
				isFetching: false,
				hasLoadedFromServer: true,
				isSubmittingForm: false,
			} );
			break;
		case DOMAINS_DNS_UPDATE_FAILED:
			state = updateDomainState( state, action.domainName, {
				isFetching: false,
				isSubmittingForm: false,
			} );
			break;
	}

	return state;
}
