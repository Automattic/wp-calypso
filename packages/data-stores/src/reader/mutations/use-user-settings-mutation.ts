import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

type MutationContext = {
	previousSettings: SubscriptionManagerUserSettings;
};

const useUserSettingsMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const emailSettingsCacheKey = useCacheKey( [ 'read', 'email-settings' ] );
	return useMutation< SubscriptionManagerUserSettings, Error, SubscriptionManagerUserSettings >( {
		mutationFn: async ( data: SubscriptionManagerUserSettings ) => {
			const { settings } = await callApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				method: 'POST',
				body: data,
				isLoggedIn,
			} );
			if ( settings.errors ) {
				if ( settings.errors.invalid_input ) {
					throw new Error( settings.errors.invalid_input.join( ', ' ) );
				} else {
					throw new Error(
						translate( 'Something went wrong.', {
							context: 'Something went wrong will saving the user settings',
						} ) as string
					);
				}
			}
			return settings;
		},
		onMutate: async ( data ) => {
			await queryClient.cancelQueries( { queryKey: emailSettingsCacheKey } );
			const previousSettings =
				queryClient.getQueryData< SubscriptionManagerUserSettings >( emailSettingsCacheKey );

			queryClient.setQueryData< SubscriptionManagerUserSettings >( emailSettingsCacheKey, {
				...previousSettings,
				...data,
			} );
			return { previousSettings: previousSettings };
		},
		onError: ( error, variables, context ) => {
			// For some reason the TypeScript compiler doesn't like the `context` parameter in this mutation
			// That's why we're using the `as MutationContext` cast here
			if ( ( context as MutationContext )?.previousSettings ) {
				queryClient.setQueryData< SubscriptionManagerUserSettings >(
					emailSettingsCacheKey,
					( context as MutationContext ).previousSettings
				);
			}
		},
		onSettled: () => {
			// pass in a more minimal key, everything to the right will be invalidated
			queryClient.invalidateQueries( {
				queryKey: [ 'read', 'email-settings' ],
			} );
		},
	} );
};

export default useUserSettingsMutation;
