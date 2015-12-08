/**
 * External dependencies
 */
import debugFactory from 'debug';
import React from 'react/addons';

/**
 * Internal dependencies
 */
import { action as UpgradesActionTypes } from 'lib/upgrades/constants';
import { getSelectedDomain, isInitialized } from './';

const debug = debugFactory( 'calypso:lib:domains:store' );

const initialState = {};

function updateSiteState( state, siteId, attributes ) {
	return React.addons.update( state, {
		[ siteId ]: {
			$apply: ( value ) => Object.assign( {}, value, attributes )
		}
	} );
}

function updateDomainState( state, siteId, domainName, attributes ) {
	return React.addons.update( state, {
		[ siteId ]: {
			list: {
				$apply: domains => domains.map( ( domain ) => {
					if ( domain.name !== domainName ) {
						return domain;
					}

					return Object.assign( {}, domain, attributes );
				} )
			}
		}
	} );
}

function reducer( state, payload ) {
	var { action } = payload,
		{ type, siteId } = action,
		domainData,
		privateDomain;

	switch ( type ) {
		case UpgradesActionTypes.DOMAINS_INITIALIZE:
			if ( isInitialized( state, siteId ) ) {
				return state;
			}

			return updateSiteState( state, siteId, {
				isFetching: false,
				hasLoadedFromServer: false,
				list: null
			} );

		case UpgradesActionTypes.DOMAINS_FETCH:
			return updateSiteState( state, siteId, {
				isFetching: true
			} );

		case UpgradesActionTypes.DOMAINS_FETCH_COMPLETED:
			return updateSiteState( state, siteId, {
				isFetching: false,
				hasLoadedFromServer: true,
				list: action.domains,
				settingPrimaryDomain: false
			} );

		case UpgradesActionTypes.DOMAINS_FETCH_FAILED:
			debug( action.error );

			return updateSiteState( state, siteId, {
				isFetching: false
			} );

		case UpgradesActionTypes.PRIMARY_DOMAIN_SET:
			return updateSiteState( state, siteId, {
				settingPrimaryDomain: true
			} );

		case UpgradesActionTypes.PRIMARY_DOMAIN_SET_COMPLETED:
		case UpgradesActionTypes.PRIMARY_DOMAIN_SET_FAILED:
			return updateSiteState( state, siteId, {
				settingPrimaryDomain: false
			} );

		case UpgradesActionTypes.PRIVACY_PROTECTION_ENABLE_COMPLETED:
			return updateDomainState( state, action.siteId, action.domainName, {
				privateDomain: true
			} );

		case UpgradesActionTypes.DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED:
			domainData = getSelectedDomain( {
				domains: getForSite( state, action.siteId ),
				selectedDomainName: action.domainName
			} );
			privateDomain = ( ! action.disablePrivacy ) && domainData.privateDomain;

			return updateDomainState( state, action.siteId, action.domainName, {
				privateDomain
			} );

		default:
			return state;
	}
}

function getForSite( state, siteId ) {
	return state[ siteId ];
}

export {
	getForSite,
	initialState,
	reducer
};
