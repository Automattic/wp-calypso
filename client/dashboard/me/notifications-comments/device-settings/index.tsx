import {
	userNotificationsSettingsQuery,
	userNotificationsSettingsMutation,
	userNotificationsDevicesQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation, useIsMutating } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	SelectControl,
	CardBody,
	Card,
	__experimentalHStack as HStack,
	Spinner,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo, useEffect } from 'react';
import { SettingsPanel, type SettingsOption } from '../../../../components/settings-panel';
import { Text } from '../../../components/text';

export const DevicesSettings = () => {
	const { data } = useSuspenseQuery( userNotificationsSettingsQuery() );
	const { mutate: updateSettings, isSuccess } = useMutation( userNotificationsSettingsMutation() );
	const { createSuccessNotice } = useDispatch( noticesStore );
	//Currently, the update settings endpoint is taking a very long time to update the settings,
	//so we are using the useIsMutating hook to check if the mutation is in progress on by any component and block the UI to prevent
	//race conditions.
	const isMutating =
		useIsMutating( {
			mutationKey: userNotificationsSettingsMutation().mutationKey,
		} ) > 0;

	const { data: devices } = useSuspenseQuery( userNotificationsDevicesQuery() );
	const [ selectedDeviceId, setSelectedDeviceId ] = useState< string | undefined >(
		devices?.[ 0 ]?.device_id
	);

	const hasDevices = devices.length > 0;
	const settings = data.other.devices.find(
		( device ) => device.device_id.toString() === selectedDeviceId
	);

	useEffect( () => {
		if ( isSuccess ) {
			createSuccessNotice( __( 'Settings saved successfully.' ), { type: 'snackbar' } );
		}
	}, [ createSuccessNotice, isSuccess ] );

	const handleChange = ( updated: SettingsOption ) => {
		updateSettings( {
			data: {
				...data,
				other: {
					...data.other,
					devices: data.other.devices.map( ( device ) =>
						device.device_id.toString() === selectedDeviceId
							? { ...device, ...{ [ updated.id ]: updated.value } }
							: device
					),
				},
			},
		} );
	};

	const options = useMemo(
		() => [
			{
				id: 'comment_like',
				label: __( 'Likes on my comments' ),
				value: settings?.comment_like || false,
			},
			{
				id: 'comment_reply',
				label: __( 'Replies to my comments' ),
				value: settings?.comment_reply || false,
			},
		],
		[ settings ]
	);

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack spacing={ 4 } alignment="left" justify="space-between">
						<Text weight="bold">{ __( 'Devices' ) }</Text>
						{ hasDevices && isMutating && <Spinner style={ { margin: 0 } } /> }
					</HStack>
					{ hasDevices && (
						<>
							<SelectControl
								disabled={ isMutating }
								value={ selectedDeviceId }
								onChange={ ( value ) => setSelectedDeviceId( value ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								{ devices.map( ( device ) => (
									<option key={ device.device_id } value={ device.device_id }>
										{ device.device_name }
									</option>
								) ) }
							</SelectControl>
							<SettingsPanel
								options={ options }
								onChange={ handleChange }
								disabled={ isMutating }
							/>
						</>
					) }
				</VStack>
				{ ! hasDevices && (
					<VStack spacing={ 4 } alignment="center" justify="center">
						<Text>{ __( 'You have no devices to configure notifications for.' ) }</Text>
					</VStack>
				) }
			</CardBody>
		</Card>
	);
};
