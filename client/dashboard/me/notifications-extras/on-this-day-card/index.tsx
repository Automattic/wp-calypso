import {
	userNotificationsSettingsMutation,
	userNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useIsMutating, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody } from '../../../components/card';

export const OnThisDayCard = () => {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data } = useSuspenseQuery( userNotificationsSettingsQuery() );
	const { mutate: updateSettings } = useMutation( userNotificationsSettingsMutation() );

	const isMutating =
		useIsMutating( {
			mutationKey: userNotificationsSettingsMutation().mutationKey,
		} ) > 0;

	const handleChange = ( nextValue: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_notifications_timeline_settings_updated', {
			setting_name: 'on_this_day',
			setting_value: nextValue,
		} );

		updateSettings(
			{ data: { other: { timeline: { on_this_day: nextValue } } } },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s is the name of the settings */ __( '"%s" settings saved.' ),
							__( 'On this day' )
						),
						{ type: 'snackbar' }
					);
				},
				onError: () => {
					createErrorNotice(
						sprintf(
							/* translators: %s is the name of the setting */ __( 'Failed to save %s settings.' ),
							__( 'On this day' )
						),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	return (
		<Card>
			<CardBody>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ !! data.other.timeline.on_this_day }
					disabled={ isMutating }
					label={ __( 'On this day' ) }
					help={ __( 'Reminders about your posts from past years' ) }
					onChange={ handleChange }
				/>
			</CardBody>
		</Card>
	);
};
