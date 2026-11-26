import {
	userNotificationsSettingsMutation,
	userNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useIsMutating, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ExternalLink, ToggleControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../components/card';

export const EmailTrackingCard = ( { source }: { source: 'extras' | 'privacy' } ) => {
	const { recordTracksEvent } = useAnalytics();

	const { data } = useSuspenseQuery( userNotificationsSettingsQuery() );
	const { mutate: updateSettings } = useMutation(
		withSnackbar( userNotificationsSettingsMutation(), {
			success: ( _data, variables ) =>
				variables.data.wpcom?.email_tracking
					? __( 'Email tracking turned on.' )
					: __( 'Email tracking turned off.' ),
			error: __( 'Failed to save email tracking settings.' ),
		} )
	);

	const isMutating =
		useIsMutating( {
			mutationKey: userNotificationsSettingsMutation().mutationKey,
		} ) > 0;

	// Hidden until the API returns the setting.
	if ( typeof data.wpcom.email_tracking !== 'boolean' ) {
		return null;
	}

	const handleChange = ( nextValue: boolean ) => {
		updateSettings(
			{ data: { wpcom: { email_tracking: nextValue } } },
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_notifications_email_tracking_updated', {
						setting_value: nextValue,
						source,
					} );
				},
			}
		);
	};

	return (
		<Card>
			<CardBody>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ data.wpcom.email_tracking }
					disabled={ isMutating }
					label={ __( 'Track email opens and clicks' ) }
					help={ createInterpolateElement(
						__(
							'We track when you open our emails and click links in them. This helps us understand what’s useful and improve what we send. You can turn it off at any time. <learnMoreLink>Learn more</learnMoreLink>'
						),
						{
							learnMoreLink: (
								<ExternalLink
									// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
									href="https://automattic.com/privacy/#information-we-collect-automatically"
									children={ null }
								/>
							),
						}
					) }
					onChange={ handleChange }
				/>
			</CardBody>
		</Card>
	);
};
