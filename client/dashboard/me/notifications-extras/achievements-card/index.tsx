import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody } from '../../../components/card';

export const AchievementsCard = () => {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: notifications } = useSuspenseQuery(
		userPreferenceQuery( 'achievements-global-notifications' )
	);
	const { mutate: setNotifications, isPending } = useMutation(
		userPreferenceOptimisticMutation( 'achievements-global-notifications' )
	);

	const handleChange = ( nextValue: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_notifications_achievements_settings_updated', {
			setting_value: nextValue,
		} );

		setNotifications( nextValue ? 'enabled' : 'disabled', {
			onSuccess: () => {
				createSuccessNotice(
					sprintf(
						/* translators: %s is the name of the settings */ __( '"%s" settings saved.' ),
						__( 'Achievements' )
					),
					{ type: 'snackbar' }
				);
			},
			onError: () => {
				createErrorNotice(
					sprintf(
						/* translators: %s is the name of the setting */ __( 'Failed to save %s settings.' ),
						__( 'Achievements' )
					),
					{ type: 'snackbar' }
				);
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ notifications !== 'disabled' }
					disabled={ isPending }
					label={ __( 'Achievements' ) }
					help={ __(
						'Receive notifications when you unlock new achievements. This setting overrides site-level settings.'
					) }
					onChange={ handleChange }
				/>
			</CardBody>
		</Card>
	);
};
