import {
	fetchSecurityKeys,
	fetchSecurityKeyRegistrationChallenge,
	validateSecurityKeyRegistration,
	deleteSecurityKey,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

const addHostnameToData = ( data: Record< string, unknown > ) => {
	if ( 'production' !== config( 'env_id' ) ) {
		data.hostname = window.location.hostname;
	}
	return data;
};

export const securityKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'security-keys' ],
		queryFn: fetchSecurityKeys,
	} );

export const securityKeyRegistrationChallengeQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'security-key-registration-challenge' ],
		queryFn: () => {
			return fetchSecurityKeyRegistrationChallenge( addHostnameToData( {} ) );
		},
	} );

export const validateSecurityKeyRegistrationMutation = () =>
	mutationOptions( {
		mutationFn: ( data: Record< string, unknown > ) => {
			return validateSecurityKeyRegistration( addHostnameToData( data ) );
		},
	} );

export const deleteSecurityKeyMutation = () =>
	mutationOptions( {
		mutationFn: deleteSecurityKey,
		onSuccess: () => {
			queryClient.invalidateQueries( securityKeysQuery() );
		},
	} );
