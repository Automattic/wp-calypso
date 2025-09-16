import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

	const {
		mutate: saveSettings,
		isPending: isSaving,
		isSuccess: isSuccessSaving,
		isError: isErrorSaving,
	} = useMutation( userSettingsMutation() );

	useEffect( () => {
		if ( isSuccessSaving ) {
			createSuccessNotice( __( 'Settings saved successfully.' ), {
				type: 'snackbar',
			} );
		}
	}, [ isSuccessSaving, createSuccessNotice ] );

	useEffect( () => {
		if ( isErrorSaving ) {
			createErrorNotice( __( 'Failed to save settings.' ), {
				type: 'snackbar',
			} );
		}
	}, [ isErrorSaving, createErrorNotice ] );

	const isDataStateDirty = useMemo(
		() => isDirty( dataState, originalSettings ),
		[ dataState, originalSettings ]
	);

	useBlocker( {
		enableBeforeUnload: isDataStateDirty,
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
