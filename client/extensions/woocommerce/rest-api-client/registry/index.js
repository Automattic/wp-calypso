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

// TODO: Unit test this.
export function registerApiType( name, apiType, apiTypes = _apiTypes ) {
	debug( 'Registering api type "' + name + '"' );
	apiTypes[ name ] = apiType;
}

export function getApiClient( apiTypeName, siteKey ) {
	return findApiClient( apiTypeName, siteKey ) || createApiClient( apiTypeName, siteKey );
}

// TODO: Unit test this.
export function findApiClient( apiTypeName, siteKey, apiClients = _apiClients ) {
	return apiClients.get( apiTypeName + '/' + siteKey );
}

// TODO: Unit test this.
export function createApiClient(
	apiTypeName,
	siteKey,
	apiTypes = _apiTypes,
	apiClients = _apiClients
) {
	debug( 'Creating api client[ ' + apiTypeName + ' ] for site "' + siteKey + '"' );
	const apiType = apiTypes[ apiTypeName ];
	if ( ! apiType ) {
		debug( 'Unrecognized api type: ' + apiTypeName );
		return undefined;
	}
	const apiClient = new ApiClient( apiTypeName, apiType, siteKey );
	apiClients.set( apiTypeName + '/' + siteKey, apiClient );
	return apiClient;
}

// TODO: Unit test this.
export function updateApiState( apiState, dispatch, apiClients = _apiClients ) {
	apiClients.forEach( client => {
		const { apiTypeName, siteKey } = client;
		const siteState = get( apiState, [ apiTypeName, siteKey ], null );
		client.setSiteState( siteState, dispatch );
	} );
}
