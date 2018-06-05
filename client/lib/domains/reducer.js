/** @format */

/**
 * External dependencies
 */
import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import { action as UpgradesActionTypes } from 'lib/upgrades/constants';
import { getSelectedDomain } from './';

const initialState = {};

function updateDomainState( state, siteId, domainName, attributes ) {
	return update( state, {
		[ siteId ]: {
			list: {
				$apply: domains =>
					domains.map( domain => {
						if ( domain.name !== domainName ) {
							return domain;
						}

						return Object.assign( {}, domain, attributes );
					} ),
			},
		},
	} );
}

function reducer( state, payload ) {
	const { action } = payload;
	const { type } = action;
	let domainData;
	let privateDomain;

	switch ( type ) {
		case UpgradesActionTypes.PRIVACY_PROTECTION_ENABLE_COMPLETED:
			return updateDomainState( state, action.siteId, action.domainName, {
				privateDomain: true,
			} );

		case UpgradesActionTypes.DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED:
			domainData = getSelectedDomain( {
				domains: getBySite( state, action.siteId ),
				selectedDomainName: action.domainName,
			} );
			privateDomain = ! action.disablePrivacy && domainData.privateDomain;

			return updateDomainState( state, action.siteId, action.domainName, {
				privateDomain,
			} );

		default:
			return state;
	}
}

function getBySite( state, siteId ) {
	return state[ siteId ];
}

export { getBySite, initialState, reducer };
