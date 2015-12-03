/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import { action as UpgradesActionTypes } from 'lib/upgrades/constants';
import DomainsStore from 'lib/domains/store';
import { getSelectedDomain } from 'lib/domains';

const initialDomainState = {
	hasLoadedFromServer: false,
	data: null,
	needsUpdate: true
};

function updateDomainState( state, domainName, data ) {
	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, state[ domainName ] || initialDomainState, data )
		}
	};

	return React.addons.update( state, command );
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case UpgradesActionTypes.WAPI_DOMAIN_INFO_FETCH:
			return updateDomainState( state, action.domainName, {
				needsUpdate: false
			} );

		case UpgradesActionTypes.WAPI_DOMAIN_INFO_FETCH_COMPLETED:
			return updateDomainState( state, action.domainName, {
				hasLoadedFromServer: true,
				data: action.status,
				needsUpdate: false
			} );

		case UpgradesActionTypes.WAPI_DOMAIN_INFO_FETCH_FAILED:
			return updateDomainState( state, action.domainName, {
				needsUpdate: true
			} );

		case UpgradesActionTypes.DOMAIN_LOCKING_ENABLE_COMPLETED:
			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					locked: true,
					pendingTransfer: false
				} )
			} );

		case UpgradesActionTypes.DOMAIN_ENABLE_PRIVACY_PROTECTION_COMPLETED:
			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					pendingTransfer: false
				} )
			} );

		case UpgradesActionTypes.DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED:
			const { data } = state[ action.domainName ],
				domainData = getSelectedDomain( {
					domains: DomainsStore.getForSite( action.siteId ),
					selectedDomainName: action.domainName
				} ),
				locked = ( ! action.unlock ) && data.locked,
				pendingTransfer = ! domainData.privateDomain && ! locked;

			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					locked,
					pendingTransfer
				} )
			} );

		case UpgradesActionTypes.DOMAIN_TRANSFER_ACCEPT_COMPLETED:
		case UpgradesActionTypes.DOMAIN_TRANSFER_DECLINE_COMPLETED:
			return updateDomainState( state, action.domainName, {
				data: Object.assign( {}, state[ action.domainName ].data, {
					pendingTransfer: false
				} )
			} );

		default:
			return state;
	}
}

export {
	initialDomainState,
	reducer
};
