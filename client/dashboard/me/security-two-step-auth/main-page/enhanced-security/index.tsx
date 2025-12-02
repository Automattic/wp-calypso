import { userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../../app/analytics';
import { Card, CardBody } from '../../../../components/card';
import { SectionHeader } from '../../../../components/section-header';

export default function EnhancedSecurity() {
	const { recordTracksEvent } = useAnalytics();

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { two_step_enhanced_security_forced, two_step_enhanced_security } = userSettings;

	const { mutate: updateUserSettings, isPending: isUpdatingUserSettings } = useMutation(
		userSettingsMutation()
	);

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleChange = ( value: boolean ) => {
		recordTracksEvent( 'calypso_dashboard_security_enhanced_security_change_click', {
			two_step_enhanced_security: value,
		} );
		updateUserSettings(
			{ two_step_enhanced_security: value },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
				},
			}
		);
	};

	return (
		<>
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
							help={ __(
								'Security keys (or passkeys) offer a more secure way to access your account. Whether it’s a physical device or another secure method, they make it significantly harder for unauthorized users to gain access.'
							) }
						/>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
