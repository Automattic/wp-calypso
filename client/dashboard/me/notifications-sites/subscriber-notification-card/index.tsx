import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../components/card';

const preference = 'notifications-subscriber-alerts-enabled';

export function SubscriberNotificationCard() {
	const { recordTracksEvent } = useAnalytics();
	const {
		data: enabled,
		isSuccess,
		isFetching,
		isError,
	} = useQuery(
		userPreferenceQuery( preference, isEnabled( 'notifications/subscriber-alerts-default-on' ) )
	);
	const { mutate: savePreference, isPending } = useMutation(
		withSnackbar( userPreferenceMutation( preference ), {
			success: __( 'Subscriber alerts saved.' ),
			error: __( 'Failed to save subscriber alerts.' ),
		} )
	);

	return (
		<Card>
			<CardBody>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ enabled === true }
					disabled={ ! isSuccess || isFetching || isError || isPending }
					label={ __( 'Subscriber alerts' ) }
					help={ __(
						'Play a sound and animate the notification bell for new subscribers. Your browser may require a click before sound can play.'
					) }
					onChange={ ( value ) =>
						savePreference( value, {
							onSuccess: () =>
								recordTracksEvent(
									'calypso_dashboard_notifications_subscriber_alerts_settings_updated',
									{
										setting_value: value,
										source: 'settings',
									}
								),
						} )
					}
				/>
			</CardBody>
		</Card>
	);
}
