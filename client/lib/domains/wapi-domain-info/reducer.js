/** @format */

/**
 * External dependencies
 */
import update from 'immutability-helper';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DOMAIN_TRANSFER_ACCEPT_COMPLETED,
	DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_DECLINE_COMPLETED,
	PRIVACY_PROTECTION_ENABLE_COMPLETED,
	WAPI_DOMAIN_INFO_FETCH,
	WAPI_DOMAIN_INFO_FETCH_COMPLETED,
	WAPI_DOMAIN_INFO_FETCH_FAILED,
} from 'lib/upgrades/action-types';

const initialDomainState = {
	hasLoadedFromServer: false,
	data: null,
	needsUpdate: true,
};

function updateDomainState( state, domainName, data ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || initialDomainState, data ),
		},
	};

	return update( state, command );
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case WAPI_DOMAIN_INFO_FETCH:
			return updateDomainState( state, action.domainName, {
				needsUpdate: false,
			} );

		case WAPI_DOMAIN_INFO_FETCH_COMPLETED:
			return updateDomainState( state, action.domainName, {
				hasLoadedFromServer: true,
				data: action.status,
				needsUpdate: false,
			} );

		case WAPI_DOMAIN_INFO_FETCH_FAILED:
			return updateDomainState( state, action.domainName, {
				needsUpdate: true,
			} );

		case DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED:
			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					locked: action.locked,
					pendingTransfer: false,
				} ),
			} );

		case PRIVACY_PROTECTION_ENABLE_COMPLETED:
			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, get( state, '[ action.domainName ].data', {} ), {
					pendingTransfer: false,
					needsUpdate: true,
				} ),
			} );

		case DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED:
			const { data } = state[ action.domainName ],
				locked = ! action.unlock && data.locked;

			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					locked,
				} ),
				needsUpdate: true,
			} );

		case DOMAIN_TRANSFER_ACCEPT_COMPLETED:
		case DOMAIN_TRANSFER_DECLINE_COMPLETED:
			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					pendingTransfer: false,
				} ),
			} );

		default:
			return state;
	}
}

export { initialDomainState, reducer };
