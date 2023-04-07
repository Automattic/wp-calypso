import { translate } from 'i18n-calypso';
import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

type MutationContext = {
	previousSettings: SubscriptionManagerUserSettings;
};

const useUserSettingsMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation< SubscriptionManagerUserSettings, Error, SubscriptionManagerUserSettings >(
		async ( data: SubscriptionManagerUserSettings ) => {
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
		{
			onMutate: async ( data ) => {
				await queryClient.cancelQueries( [ 'read', 'email-settings', isLoggedIn ] );
				const previousSettings = queryClient.getQueryData< SubscriptionManagerUserSettings >( [
					'read',
					'email-settings',
					isLoggedIn,
				] );

				queryClient.setQueryData< SubscriptionManagerUserSettings >(
					[ 'read', 'email-settings', isLoggedIn ],
					{ ...previousSettings, ...data }
				);
				return { previousSettings: previousSettings };
			},
			onError: ( error, variables, context ) => {
				// For some reason the TypeScript compiler doesn't like the `context` parameter in this mutation
				// That's why we're using the `as MutationContext` cast here
				if ( ( context as MutationContext )?.previousSettings ) {
					queryClient.setQueryData< SubscriptionManagerUserSettings >(
						[ 'read', 'email-settings', isLoggedIn ],
						( context as MutationContext ).previousSettings
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( [ 'read', 'email-settings', isLoggedIn ] );
			},
		}
	);
};

export default useUserSettingsMutation;
