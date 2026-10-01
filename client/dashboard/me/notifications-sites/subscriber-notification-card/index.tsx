import {
	rawUserPreferencesQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../components/card';
import type { UserPreferences } from '@automattic/api-core';

const preference = 'notifications-subscriber-alerts-enabled';

export function SubscriberNotificationCard() {
	const queryClient = useQueryClient();
	const {
		data: enabled,
		isSuccess,
		isFetching,
		isError,
	} = useQuery( userPreferenceQuery( preference ) );
	const { mutate: savePreference, isPending } = useMutation( {
		...withSnackbar( userPreferenceMutation( preference ), {
			success: __( 'Subscriber alerts saved.' ),
			error: __( 'Failed to save subscriber alerts.' ),
		} ),
		onSuccess: ( preferences ) => {
			queryClient.setQueryData< UserPreferences >(
				rawUserPreferencesQuery().queryKey,
				( previous ) => ( { ...previous, ...preferences } )
			);
		},
	} );

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
