import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useNotice } from '../../../app/hooks/use-notice';
import { getSettings, getSettingsKeys, SubscriptionSettingsForm, type SettingsData } from './form';

const isDirty = ( dataState: SettingsData, originalSettings: SettingsData ) => {
	const keys = getSettingsKeys();

	return keys.some( ( key ) => {
		const isDirty = dataState[ key ] !== originalSettings[ key ];
		return isDirty;
	} );
};

export const SubscriptionSettings = () => {
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const { data: rawSettings } = useSuspenseQuery( userSettingsQuery() );
	const originalSettings = getSettings( rawSettings );

	const [ dataState, setDataState ] = useState< SettingsData >( originalSettings );

	const { createSuccessNotice, createErrorNotice } = useNotice();
	const queryClient = useQueryClient();

	const { mutate: saveSettings, isPending: isSaving } = useMutation( {
		...userSettingsMutation(),
		onSuccess: async () => {
			createSuccessNotice( __( 'Settings saved successfully.' ), {
				type: 'snackbar',
			} );
			//It is necessary to make the UI load the updated originalSettings
			await queryClient.invalidateQueries( userSettingsQuery() );
		},
		onError: () => {
			createErrorNotice( __( 'Failed to save settings.' ), {
				type: 'snackbar',
			} );
		},
	} );

	const isDataStateDirty = useMemo(
		() => isDirty( dataState, originalSettings ),
		[ dataState, originalSettings ]
	);

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();
			saveSettings( dataState );
		},
		[ dataState, saveSettings ]
	);

	const handleChange = useCallback(
		( newData: SettingsData ) => {
			setDataState( newData );
		},
		[ setDataState ]
	);

	useBlocker( {
		enableBeforeUnload: true,
		shouldBlockFn: () => {
			if ( ! isDataStateDirty ) {
				return false;
			}

			const shouldLeave = confirm(
				__( 'You have unsaved changes. Are you sure you want to leave?' )
			);

			return ! shouldLeave;
		},
	} );

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SubscriptionSettingsForm
							data={ dataState }
							isAutomattician={ isAutomattician }
							onChange={ handleChange }
						/>

						<HStack alignment="start" justify="flex-start">
							<Button
								type="submit"
								variant="primary"
								disabled={ isSaving || ! isDataStateDirty }
								isBusy={ isSaving }
							>
								{ __( 'Save' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
};
