import { InputUserNotificationSettings } from '@automattic/api-core';
import {
	userNotificationsSettingsMutation,
	userNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useIsMutating, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { SettingsPanel, type SettingsOption } from '../../../../components/settings-panel';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';

export const WebSettings = () => {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data } = useSuspenseQuery( {
		...userNotificationsSettingsQuery(),
		meta: {
			persist: false,
		},
	} );

	const settings = data?.other.timeline;
	const { mutate: updateSettings } = useMutation( userNotificationsSettingsMutation() );

	const isMutating =
		useIsMutating( {
			mutationKey: userNotificationsSettingsMutation().mutationKey,
		} ) > 0;

	const handleChange = ( updated: SettingsOption ) => {
		const updatedSettings = {
			other: {
				timeline: { ...settings, [ updated.id ]: updated.value },
			},
		} as InputUserNotificationSettings;

		recordTracksEvent( 'calypso_dashboard_notifications_timeline_settings_updated', {
			setting_name: updated.id,
			setting_value: updated.value,
		} );

		updateSettings(
			{ data: updatedSettings },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s is the name of the setting */
							__( '"%s" settings saved.' ),
							updated.label
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
						<SectionHeader level={ 3 } title={ __( 'Web' ) } />
					</HStack>
					<SettingsPanel options={ options } onChange={ handleChange } disabled={ isMutating } />
				</VStack>
			</CardBody>
		</Card>
	);
};
