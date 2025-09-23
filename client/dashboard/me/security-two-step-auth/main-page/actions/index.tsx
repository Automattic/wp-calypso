import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ActionList } from '../../../../components/action-list';
import DisableTwoStepDialog from './disable-two-step-dialog';

export default function TwoStepAuthActions() {
	const router = useRouter();

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { two_step_enhanced_security_forced } = userSettings;

	const [ showDisableDialog, setShowDisableDialog ] = useState( false );

	return (
		<>
			<ActionList>
				<ActionList.ActionItem
					title={ __( 'Generate new backup codes' ) }
					actions={
						<Button
							onClick={ () => router.navigate( { to: '/me/security/two-step-auth/backup-codes' } ) }
							variant="secondary"
							size="compact"
						>
							{ __( 'Generate backup codes' ) }
						</Button>
					}
				/>
				<ActionList.ActionItem
					title={ __( 'Disable two-step authentication' ) }
					actions={
						<Button
							isDestructive
							onClick={ () => setShowDisableDialog( true ) }
							variant="secondary"
							size="compact"
							disabled={ two_step_enhanced_security_forced }
						>
							{ __( 'Disable' ) }
						</Button>
					}
					description={
						two_step_enhanced_security_forced
							? __(
									'Two-step authentication is currently required by your organization. To make changes, please contact your administrator.'
							  )
							: undefined
					}
				/>
			</ActionList>
			{ showDisableDialog && (
				<DisableTwoStepDialog onClose={ () => setShowDisableDialog( false ) } />
			) }
		</>
	);
}
