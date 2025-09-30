import { InputUserNotificationSettings } from '@automattic/api-core';
import {
	userNotificationsSettingsMutation,
	userNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useIsMutating, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { SettingsPanel, type SettingsOption } from '../../../../components/settings-panel';
import { SectionHeader } from '../../../components/section-header';

export const WebSettings = () => {
	const { data } = useSuspenseQuery( {
		...userNotificationsSettingsQuery(),
		meta: {
			persist: false,
		},
	} );

	const settings = data?.other.timeline;
	const { mutate: updateSettings } = useMutation( {
		...userNotificationsSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved successfully.' ),
				error: __( 'There was a problem saving your changes. Please, try again.' ),
			},
		},
	} );

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

		updateSettings( { data: updatedSettings } );
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
