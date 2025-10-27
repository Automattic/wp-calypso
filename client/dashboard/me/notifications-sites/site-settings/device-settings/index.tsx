import { DeviceNotificationSettings } from '@automattic/api-core';
import {
	userNotificationsDevicesQuery,
	userNotificationsSettingsMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { SettingsOption, SettingsPanel } from '../../../../../components/settings-panel';
import { useAnalytics } from '../../../../app/analytics';
import { getFieldLabel } from '../../helpers/translations';
import { useSiteSettings } from '../../hooks';
import { ApplySettingsToAllSitesConfirmationModal } from '../apply-settings-to-all-sites-confirmation-modal';

export const DevicesSettings = ( { siteId }: { siteId: number } ) => {
	const { data: blogSettings } = useSiteSettings( siteId );
	const { data: devices } = useSuspenseQuery( userNotificationsDevicesQuery() );
	const { mutate: updateSettings, isPending: isUpdating } = useMutation(
		userNotificationsSettingsMutation()
	);
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ selectedDeviceId, setSelectedDeviceId ] = useState< string | undefined >(
		devices?.[ 0 ]?.device_id
	);
	const settings = blogSettings?.devices?.find(
		( device ) => device.device_id.toString() === selectedDeviceId
	);

	const hasDevices = Array.isArray( devices ) && devices.length > 0;

	const handleDeviceChange = ( deviceId: string ) => {
		setSelectedDeviceId( deviceId );
	};

	const handleChange = ( item: SettingsOption ) => {
		updateSettings(
			{
				data: {
					blogs: [
						{
							blog_id: siteId,
							devices: [ { ...settings, [ item.id ]: item.value } as DeviceNotificationSettings ],
						},
					],
				},
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_notifications_devices_settings_updated', {
						setting_name: item.id,
						setting_value: item.value,
						site_id: siteId,
					} );
					createSuccessNotice(
						sprintf(
							/* translators: %s is the name of the setting */
							__( '"%s" settings saved.' ),
							item.label
						),
						{
							type: 'snackbar',
						}
					);
				},
				onError: () => {
					createErrorNotice( __( 'There was a problem saving your changes. Please, try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const askForConfirmation = () => {
		setIsConfirmDialogOpen( true );
	};

	const options = useMemo(
		() => [
			{
				id: 'new_comment',
				label: getFieldLabel( 'new_comment' ),
				value: settings?.new_comment ?? false,
			},
			{
				id: 'comment_like',
				label: getFieldLabel( 'comment_like' ),
				value: settings?.comment_like ?? false,
			},

			{
				id: 'post_like',
				label: getFieldLabel( 'post_like' ),
				value: settings?.post_like ?? false,
			},

			{
				id: 'follow',
				label: getFieldLabel( 'follow' ),
				value: settings?.follow ?? false,
			},

			{
				id: 'achievement',
				label: getFieldLabel( 'achievement' ),
				value: settings?.achievement ?? false,
			},

			{
				id: 'mentions',
				label: __( 'Username mentions' ),
				value: settings?.mentions ?? false,
			},

			{
				id: 'scheduled_publicize',
				label: getFieldLabel( 'scheduled_publicize' ),
				value: settings?.scheduled_publicize ?? false,
			},
		],
		[ settings ]
	);

	const handleApplyAll = () => {
		if ( ! blogSettings ) {
			return;
		}

		updateSettings(
			{
				data: {
					blogs: [ blogSettings ],
				},
				applyToAll: true,
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_notifications_settings_apply_to_all_sites', {
						stream: 'devices',
						device_to_be_used_as_template: siteId,
						site_to_be_used_as_template: siteId,
					} );
					createSuccessNotice( __( 'Settings saved successfully.' ), { type: 'snackbar' } );
					setIsConfirmDialogOpen( false );
				},
			}
		);
	};

	return (
		<>
			<ApplySettingsToAllSitesConfirmationModal
				onCancel={ () => setIsConfirmDialogOpen( false ) }
				onConfirm={ handleApplyAll }
				isBusy={ isUpdating }
				isOpen={ isConfirmDialogOpen }
			/>
			<VStack alignment="stretch" spacing={ 4 }>
				<Text variant="muted">
					{ createInterpolateElement(
						__(
							'Get instant notifications from your sites directly on your device. Just install the <link>Jetpack app</link>'
						),
						{
							link: (
								<ExternalLink
									href={ localizeUrl( 'https://apps.wordpress.com/mobile' ) }
									children={ null }
								/>
							),
						}
					) }
				</Text>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Select device' ) }
					value={ selectedDeviceId?.toString() }
					onChange={ handleDeviceChange }
					disabled={ isUpdating || ! hasDevices }
				>
					{ hasDevices &&
						devices?.map( ( device ) => (
							<option key={ device.device_id } value={ device.device_id }>
								{ device.device_name }
							</option>
						) ) }
					{ ! hasDevices && <option value="">{ __( 'No devices found' ) }</option> }
				</SelectControl>
				<SettingsPanel
					options={ options }
					disabled={ isUpdating || ! hasDevices }
					onChange={ handleChange }
				/>
				<HStack spacing={ 4 } alignment="start" justify="flex-start">
					<Button
						onClick={ askForConfirmation }
						variant="primary"
						isBusy={ isUpdating }
						disabled={ isUpdating || ! hasDevices }
					>
						{ __( 'Apply to all sites' ) }
					</Button>
				</HStack>
			</VStack>
		</>
	);
};
