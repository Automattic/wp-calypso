import {
	fetchTwoStepAuthSecurityKeys,
	fetchTwoStepAuthSecurityKeyRegistrationChallenge,
	validateTwoStepAuthSecurityKeyRegistration,
	deleteTwoStepAuthSecurityKey,
	fetchTwoStepAuthApplicationPasswords,
	createTwoStepAuthApplicationPassword,
	deleteTwoStepAuthApplicationPassword,
	fetchTwoStepAuthAppSetup,
	validateTwoStepAuthCode,
	generateTwoStepAuthBackupCodes,
	updateUserSettings,
	sendTwoStepAuthSMSCode,
} from '@automattic/api-core';
import { create } from '@github/webauthn-json';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { userSettingsQuery } from './me-settings';
import { queryClient } from './query-client';
import type { UserSettings } from '@automattic/api-core';

export const twoStepAuthSecurityKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'security-keys' ],
		queryFn: fetchTwoStepAuthSecurityKeys,
	} );

// The hostname is the WebAuthn relying party ID. Keys must be scoped to wordpress.com to be
// usable at login, not to whichever host the dashboard is served from.
export const registerTwoStepAuthSecurityKeyMutation = ( hostname = 'wordpress.com' ) =>
	mutationOptions( {
		meta: { statId: '2fa-security-key-register' },
		mutationFn: async ( keyName: string ) => {
			// First, fetch the registration challenge
			const options = await fetchTwoStepAuthSecurityKeyRegistrationChallenge( { hostname } );

			// Create the WebAuthn credential
			const credential = await create( { publicKey: options } );

			// Validate the registration with the server
			const validationData = {
				data: JSON.stringify( credential ),
				name: keyName,
				hostname,
			};

			return await validateTwoStepAuthSecurityKeyRegistration( validationData );
		},
		onSuccess: () => {
			queryClient.invalidateQueries( twoStepAuthSecurityKeysQuery() );
		},
	} );

export const deleteTwoStepAuthSecurityKeyMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-security-key-delete' },
		mutationFn: deleteTwoStepAuthSecurityKey,
		onSuccess: () => {
			queryClient.invalidateQueries( twoStepAuthSecurityKeysQuery() );
		},
	} );

export const twoStepAuthApplicationPasswordsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'application-passwords' ],
		queryFn: fetchTwoStepAuthApplicationPasswords,
	} );

export const createTwoStepAuthApplicationPasswordMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-app-pw-create' },
		mutationFn: createTwoStepAuthApplicationPassword,
		onSuccess: () => {
			queryClient.invalidateQueries( twoStepAuthApplicationPasswordsQuery() );
		},
	} );

export const deleteTwoStepAuthApplicationPasswordMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-app-pw-delete' },
		mutationFn: deleteTwoStepAuthApplicationPassword,
		onSuccess: () => {
			queryClient.invalidateQueries( twoStepAuthApplicationPasswordsQuery() );
		},
	} );

export const twoStepAuthAppSetupQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'app-auth-setup' ],
		queryFn: fetchTwoStepAuthAppSetup,
	} );

export const validateTwoStepAuthCodeMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-code-validate' },
		mutationFn: validateTwoStepAuthCode,
		onSuccess: ( data ) => {
			// This is a workaround to handle the error/success response
			// from the API as it always returns 200 status code.
			if ( data.success === true ) {
				queryClient.invalidateQueries( userSettingsQuery() );
			} else {
				// when invalid code, data.success is false
				throw new Error( 'Invalid code', { cause: 'invalid_code' } );
			}
		},
	} );

export const generateTwoStepAuthBackupCodesMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-backup-codes-generate' },
		mutationFn: generateTwoStepAuthBackupCodes,
	} );

export const setupTwoStepAuthSMSMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-sms-setup' },
		mutationFn: async ( data: Partial< UserSettings > ) => {
			try {
				await updateUserSettings( data );
				return await sendTwoStepAuthSMSCode();
			} catch ( error ) {
				throw new Error( 'SMS setup failed.', { cause: error } );
			}
		},
	} );

export const resendTwoStepAuthSMSCodeMutation = () =>
	mutationOptions( {
		meta: { statId: '2fa-sms-code-resend' },
		mutationFn: sendTwoStepAuthSMSCode,
	} );
