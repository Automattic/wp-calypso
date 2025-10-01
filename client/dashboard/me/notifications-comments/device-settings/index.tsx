import {
	userNotificationsSettingsQuery,
	userNotificationsSettingsMutation,
	userNotificationsDevicesQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation, useIsMutating } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	SelectControl,
	CardBody,
	Card,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { SettingsPanel, type SettingsOption } from '../../../../components/settings-panel';
import { SectionHeader } from '../../../components/section-header';

export const DevicesSettings = () => {
	const { data } = useSuspenseQuery( userNotificationsSettingsQuery() );
	const { mutate: updateSettings } = useMutation( {
		...userNotificationsSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved successfully.' ),
				error: __( 'There was a problem saving your changes. Please, try again.' ),
			},
		},
	} );
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

	const handleChange = ( updated: SettingsOption ) => {
		const updatedDevices = data?.other?.devices?.map( ( device ) => {
			if ( device.device_id.toString() === selectedDeviceId ) {
				return {
					...device,
					[ updated.id ]: updated.value,
				};
			}
			return device;
		} );

		updateSettings( {
			data: {
				other: {
					devices: updatedDevices,
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
						<SectionHeader
							level={ 3 }
							title={ __( 'Devices' ) }
							description={ createInterpolateElement(
								__(
									'Get instant notifications from your sites directly on your device. Just install the <link>Jetpack app.</link>'
								),
								{
									link: (
										<ExternalLink href="https://wordpress.org" rel="noopener noreferrer">
											{ /* Workaround for the fact that the ExternalLink component expects a children prop */ }
											{ null }
										</ExternalLink>
									),
								}
							) }
						/>
					</HStack>
					<SelectControl
						disabled={ isMutating || ! hasDevices }
						value={ selectedDeviceId }
						onChange={ ( value ) => setSelectedDeviceId( value ) }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						{ hasDevices &&
							devices.map( ( device ) => (
								<option key={ device.device_id } value={ device.device_id }>
									{ device.device_name }
								</option>
							) ) }
						{ ! hasDevices && <option value="">{ __( 'No devices found' ) }</option> }
					</SelectControl>
					<SettingsPanel
						options={ options }
						onChange={ handleChange }
						disabled={ isMutating || ! hasDevices }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
};
