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
	Spinner,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useMemo } from 'react';
import { SettingsPanel, type SettingsOption } from '../../../../components/settings-panel';
import { Text } from '../../../components/text';

export const WebSettings = () => {
	const { data } = useSuspenseQuery( {
		...userNotificationsSettingsQuery(),
		meta: {
			persist: false,
		},
	} );

	const settings = data?.other.timeline;
	const { mutate: updateSettings, isSuccess } = useMutation( userNotificationsSettingsMutation() );
	const { createSuccessNotice } = useDispatch( noticesStore );

	useEffect( () => {
		if ( isSuccess ) {
			createSuccessNotice( __( 'Settings saved successfully.' ), { type: 'snackbar' } );
		}
	}, [ createSuccessNotice, isSuccess ] );

	const isMutating =
		useIsMutating( {
			mutationKey: userNotificationsSettingsMutation().mutationKey,
		} ) > 0;

	const handleChange = ( updated: SettingsOption ) => {
		const updatedSettings = {
			other: {
				timeline: { [ updated.id ]: updated.value },
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
						<Text weight={ 500 }>{ __( 'Web' ) }</Text>
						{ isMutating && <Spinner style={ { margin: 0 } } /> }
					</HStack>
					<SettingsPanel options={ options } onChange={ handleChange } disabled={ isMutating } />
				</VStack>
			</CardBody>
		</Card>
	);
};
