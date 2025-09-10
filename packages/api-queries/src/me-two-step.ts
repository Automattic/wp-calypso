import {
	fetchSecurityKeys,
	fetchSecurityKeyRegistrationChallenge,
	validateSecurityKeyRegistration,
	deleteSecurityKey,
	fetchApplicationPasswords,
	createApplicationPassword,
	deleteApplicationPassword,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { create } from '@github/webauthn-json';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const securityKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'security-keys' ],
		queryFn: fetchSecurityKeys,
	} );

export const registerSecurityKeyMutation = () =>
	mutationOptions( {
		mutationFn: async ( keyName: string ) => {
			// Get hostname for non-production environments
			const hostname = 'production' !== config( 'env_id' ) ? window.location.hostname : undefined;

			// First, fetch the registration challenge
			const options = await fetchSecurityKeyRegistrationChallenge( { hostname } );

			// Create the WebAuthn credential
			const credential = await create( { publicKey: options } );

			// Validate the registration with the server
			const validationData = {
				data: JSON.stringify( credential ),
				name: keyName,
				hostname,
			};

			return await validateSecurityKeyRegistration( validationData );
		},
		onSuccess: () => {
			queryClient.invalidateQueries( securityKeysQuery() );
		},
	} );

export const deleteSecurityKeyMutation = () =>
	mutationOptions( {
		mutationFn: deleteSecurityKey,
		onSuccess: () => {
			queryClient.invalidateQueries( securityKeysQuery() );
		},
	} );

export const applicationPasswordsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'application-passwords' ],
		queryFn: fetchApplicationPasswords,
	} );

export const createApplicationPasswordMutation = () =>
	mutationOptions( {
		mutationFn: createApplicationPassword,
		onSuccess: () => {
			queryClient.invalidateQueries( applicationPasswordsQuery() );
		},
	} );

export const deleteApplicationPasswordMutation = () =>
	mutationOptions( {
		mutationFn: deleteApplicationPassword,
		onSuccess: () => {
			queryClient.invalidateQueries( applicationPasswordsQuery() );
		},
	} );
