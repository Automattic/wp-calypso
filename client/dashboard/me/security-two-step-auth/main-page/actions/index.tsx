import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { ActionList } from '../../../../components/action-list';
import DisableTwoStepDialog from './disable-two-step-dialog';

export default function TwoStepAuthActions() {
	const { recordTracksEvent } = useAnalytics();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { two_step_enhanced_security_forced } = userSettings;

	const [ showDisableDialog, setShowDisableDialog ] = useState( false );

	return (
		<>
			<ActionList>
				<ActionList.ActionItem
					title={ __( 'Disable two-step authentication' ) }
					description={
						two_step_enhanced_security_forced
							? __(
									'Two-step authentication is currently required by your organization. To make changes, please contact your administrator.'
							  )
							: undefined
					}
					actions={
						<Button
							isDestructive
							onClick={ () => {
								recordTracksEvent(
									'calypso_dashboard_security_two_step_auth_actions_disable_two_step_authentication_click'
								);
								setShowDisableDialog( true );
							} }
							variant="secondary"
							size="compact"
							disabled={ two_step_enhanced_security_forced }
						>
							{ __( 'Disable' ) }
						</Button>
					}
				/>
			</ActionList>
			{ showDisableDialog && (
				<DisableTwoStepDialog onClose={ () => setShowDisableDialog( false ) } />
			) }
		</>
	);
}
