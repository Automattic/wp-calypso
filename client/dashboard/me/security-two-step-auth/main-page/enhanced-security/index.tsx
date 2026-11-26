import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../../app/analytics';
import { withSnackbar } from '../../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../../components/card';
import { SectionHeader } from '../../../../components/section-header';

export default function EnhancedSecurity() {
	const { recordTracksEvent } = useAnalytics();

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const { two_step_enhanced_security_forced, two_step_enhanced_security } = userSettings;

	const { mutate: updateUserSettings, isPending: isUpdatingUserSettings } = useMutation(
		withSnackbar( userSettingsMutation(), {
			success: ( _data, { two_step_enhanced_security: isEnabled } ) =>
				isEnabled
					? __( 'Enhanced account security enabled.' )
					: __( 'Enhanced account security disabled.' ),
			error: ( _error, { two_step_enhanced_security: isEnabled } ) =>
				isEnabled
					? __( 'Failed to enable enhanced account security.' )
					: __( 'Failed to disable enhanced account security.' ),
		} )
	);

	const handleChange = ( isEnabled: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_security_enhanced_security_change_click', {
			two_step_enhanced_security: isEnabled,
		} );
		updateUserSettings( { two_step_enhanced_security: isEnabled } );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader title={ __( 'Enhanced account security' ) } level={ 3 } />
					<ToggleControl
						__nextHasNoMarginBottom
						checked={ two_step_enhanced_security }
						onChange={ handleChange }
						disabled={ two_step_enhanced_security_forced || isUpdatingUserSettings }
						label={
							two_step_enhanced_security_forced
								? __(
										'Your account is currently required to use security keys (passkeys) as a second factor.'
									)
								: __(
										'Secure your account by requiring the use of security keys (passkeys) as second factor.'
									)
						}
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}
