import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody } from '../../../components/card';
import { getSettings, getSettingsKeys, SubscriptionSettingsForm, type SettingsData } from './form';

const isDirty = ( dataState: SettingsData, originalSettings: SettingsData ) => {
	const keys = getSettingsKeys();

	return keys.some( ( key ) => {
		const isDirty = dataState[ key ] !== originalSettings[ key ];
		return isDirty;
	} );
};

const getUpdatedSettings = (
	dataState: SettingsData,
	originalSettings: SettingsData
): Partial< SettingsData > => {
	return Object.fromEntries(
		Object.entries( dataState ).filter( ( [ key, value ] ) => {
			return value !== originalSettings[ key as keyof SettingsData ];
		} )
	);
};

export const SubscriptionSettings = () => {
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const { data: rawSettings } = useSuspenseQuery( userSettingsQuery() );
	const originalSettings = getSettings( rawSettings );
	const [ dataState, setDataState ] = useState< SettingsData >( originalSettings );
	const { recordTracksEvent } = useAnalytics();

	const { mutate: saveSettings, isPending: isSaving } = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Subscription settings saved.' ),
				error: __( 'Failed to save subscription settings.' ),
			},
		},
	} );

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

			saveSettings( dataState, {
				onSuccess: () => {
					const changedSettings = getUpdatedSettings( dataState, originalSettings );
					Object.entries( changedSettings ).forEach( ( [ key, value ] ) => {
						recordTracksEvent( 'calypso_dashboard_notifications_emails_settings_updated', {
							setting_name: key,
							setting_value: value,
						} );
					} );
				},
			} );
		},
		[ dataState, recordTracksEvent, saveSettings, originalSettings ]
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
