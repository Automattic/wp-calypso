import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../components/card';

const preference = 'notifications-subscriber-alerts-enabled';

export function SubscriberNotificationCard() {
	const {
		data: enabled,
		isSuccess,
		isFetching,
		isError,
	} = useQuery( userPreferenceQuery( preference ) );
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
					onChange={ ( value ) => savePreference( value ) }
				/>
			</CardBody>
		</Card>
	);
}
