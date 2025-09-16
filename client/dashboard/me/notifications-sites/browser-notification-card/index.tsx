import {
	notificationDeviceQuery,
	notificationDeviceRegistrationMutation,
	notificationDeviceRemovalMutation,
} from '@automattic/api-queries';
import { type PushNotificationStatus } from '@automattic/api-queries/src/notification-devices';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	Spinner,
	ToggleControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';

const shouldRemove = ( status: string | undefined ) => {
	if ( ! status ) {
		return false;
	}

	return [ 'denied', 'not-supported' ].includes( status );
};

export const BrowserNotificationCard = ( {
	status,
}: {
	status: PushNotificationStatus | undefined;
} ) => {
	const {
		mutate: registerDevice,
		isPending: isRegisteringDevice,
		error: deviceError,
	} = useMutation( notificationDeviceRegistrationMutation() );
	const { data: device, isLoading: isLoadingDevice } = useQuery( notificationDeviceQuery() );
	const { mutate: removeDevice, isPending: isRemoving } = useMutation(
		notificationDeviceRemovalMutation()
	);
	const deviceId = device?.ID;

	const isPending = isLoadingDevice || isRegisteringDevice || isRemoving;
	const disabled = isPending || [ 'not-supported', 'denied' ].includes( status ?? '' );
	const [ checked, setChecked ] = useState( !! deviceId );
	const hasDevice = !! deviceId;
	const shouldRemoveDevice = ( shouldRemove( status ) || ! checked ) && hasDevice;
	const shouldCreateDevice =
		checked && ( status === 'prompt' || status === 'granted' ) && ! hasDevice;

	useEffect( () => {
		if ( deviceError ) {
			setChecked( false );
		}
	}, [ deviceError ] );

	useEffect( () => {
		if ( status === 'prompt' || status === 'denied' ) {
			setChecked( false );
		}
	}, [ status ] );

	useEffect( () => {
		if ( shouldRemoveDevice && ! isRemoving ) {
			return removeDevice( deviceId );
		}

		if ( shouldCreateDevice ) {
			return registerDevice();
		}
	}, [
		deviceId,
		isRemoving,
		registerDevice,
		removeDevice,
		shouldCreateDevice,
		shouldRemoveDevice,
	] );

	const handleChange = () => {
		setChecked( ! checked );
	};

	return (
		<Card>
			<CardBody>
				<HStack spacing={ 4 } alignment="top">
					<VStack spacing={ 4 }>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Enable browser notifications' ) }
							checked={ checked }
							onChange={ handleChange }
							disabled={ disabled }
							help={ __(
								'Get instant notifications for new comments and likes, even when you are not actively using WordPress.com.'
							) }
						/>
					</VStack>

					{ isPending && <Spinner /> }
				</HStack>
			</CardBody>
		</Card>
	);
};
