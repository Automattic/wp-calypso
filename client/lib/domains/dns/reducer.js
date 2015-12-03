/**
 * External dependencies
 */
import filter from 'lodash/collection/filter';
import React from 'react/addons';
import escapeRegExp from 'lodash/string/escapeRegExp';

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
	const command = {},
		records = filter( state[ domainName ].records, function( item ) {
			return record.id !== item.id || record.name !== item.name || record.data !== item.data || record.type !== item.type;
		} );

	command[ domainName ] = { records: { $set: records } };

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
