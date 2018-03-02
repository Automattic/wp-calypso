/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ApiClient from '../api-client';

const debug = debugFactory( 'rest-api-client:registry' );
const _apiTypes = {};
const _apiClients = new Map();

export function registerApiType( name, apiType ) {
	debug( 'Registering api type "' + name + '"' );
	_apiTypes[ name ] = apiType;
}

export function getApiClient( apiTypeName, siteKey ) {
	return findApiClient( apiTypeName, siteKey ) || createApiClient( apiTypeName, siteKey );
}

export function findApiClient( apiTypeName, siteKey ) {
	return _apiClients.get( apiTypeName + '/' + siteKey );
}

export function createApiClient( apiTypeName, siteKey ) {
	debug( 'Creating api client[ ' + apiTypeName + ' ] for site "' + siteKey + '"' );
	const apiType = _apiTypes[ apiTypeName ];
	if ( ! apiType ) {
		debug( 'Unrecognized api type: ' + apiTypeName );
		return undefined;
	}
	const apiClient = new ApiClient( apiTypeName, apiType, siteKey );
	_apiClients.set( apiTypeName + '/' + siteKey, apiClient );
	return apiClient;
}

export function updateApiState( apiState, dispatch ) {
	_apiClients.forEach( client => {
		const { apiTypeName, siteKey } = client;
		const siteState = get( apiState, [ apiTypeName, siteKey ], null );
		client.setSiteState( siteState, dispatch );
	} );
}
