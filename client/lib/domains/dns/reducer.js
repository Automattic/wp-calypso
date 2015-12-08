/**
 * External dependencies
 */
import findIndex from 'lodash/array/findIndex';
import escapeRegExp from 'lodash/string/escapeRegExp';
import React from 'react/addons';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';

function updateDomainState( state, domainName, dns ) {
	const command = {
		[ domainName ]: { $set: dns }
	};

	return React.addons.update( state, command );
}

function addDns( state, domainName, record ) {
	const domainSuffix = new RegExp( '\\.' + escapeRegExp( domainName ) + '\\.$' ),
		newRecord = Object.assign( {}, record, {
			name: record.name.replace( domainSuffix, '' )
		} );

	return React.addons.update( state, {
		[ domainName ]: { records: { $push: [ newRecord ] } }
	} );
}

function deleteDns( state, domainName, record ) {
	const { id, data, name, type } = record,
		index = findIndex( state[ domainName ].records, { id, data, name, type } );

	if ( index === -1 ) {
		return state;
	}

	const command = {
		[ domainName ]: { records: { $splice: [ [ index, 1 ] ] } }
	};

	return React.addons.update( state, command );
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.DNS_DELETE:
			if ( ! action.error ) {
				state = deleteDns( state, action.domainName, action.record );
			}
			break;

		case ActionTypes.DNS_ADD_COMPLETED:
			if ( ! action.error ) {
				state = addDns( state, action.domainName, action.record );
			}
			break;
		case ActionTypes.DNS_FETCH:
			if ( ! state[ action.domainName ] ) {
				state = updateDomainState( state, action.domainName, {
					hasLoadedFromServer: false
				} );
			}
			break;
		case ActionTypes.DNS_FETCH_COMPLETED:
			state = updateDomainState( state, action.domainName, {
				records: action.records,
				hasLoadedFromServer: true
			} );
			break;
	}

	return state;
}

export {
	reducer
};
