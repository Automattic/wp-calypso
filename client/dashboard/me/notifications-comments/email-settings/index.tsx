import {
	userNotificationsSettingsMutation,
	userNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useIsMutating, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	CardBody,
	Card,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { SettingsPanel, type SettingsOption } from '../../../../components/settings-panel';
import { useAnalytics } from '../../../app/analytics';
import { SectionHeader } from '../../../components/section-header';

export const EmailSettings = () => {
	const { data } = useSuspenseQuery( userNotificationsSettingsQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { mutate: updateSettings } = useMutation( {
		...userNotificationsSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved successfully.' ),
				error: __( 'There was a problem saving your changes. Please, try again.' ),
			},
		},
	} );

	const settings = data.other.email;
	const isMutating =
		useIsMutating( {
			mutationKey: userNotificationsSettingsMutation().mutationKey,
		} ) > 0;

	const handleChange = ( updated: SettingsOption ) => {
		recordTracksEvent( 'calypso_dashboard_notifications_email_settings_updated', {
			setting_name: updated.id,
			setting_value: updated.value,
		} );

		updateSettings( {
			data: {
				other: {
					email: { ...settings, [ updated.id ]: updated.value },
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
						<SectionHeader level={ 3 } title={ __( 'Email' ) } />
					</HStack>
					<SettingsPanel options={ options } onChange={ handleChange } disabled={ isMutating } />
				</VStack>
			</CardBody>
		</Card>
	);
};
