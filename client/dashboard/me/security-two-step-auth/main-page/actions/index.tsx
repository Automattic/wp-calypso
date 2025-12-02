import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { securityTwoStepAuthBackupCodesRoute } from '../../../../app/router/me';
import { ActionList } from '../../../../components/action-list';
import ConfirmModal from '../../../../components/confirm-modal';
import DisableTwoStepDialog from './disable-two-step-dialog';

export default function TwoStepAuthActions() {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { two_step_enhanced_security_forced } = userSettings;

	const [ showDisableDialog, setShowDisableDialog ] = useState( false );
	const [ showGenerateBackupCodesDialog, setShowGenerateBackupCodesDialog ] = useState( false );

	return (
		<>
			<ActionList>
				<ActionList.ActionItem
					title={ __( 'Generate new backup codes' ) }
					description={ __(
						'When you generate new backup codes, any previously generated codes will be disabled for added security.'
					) }
					actions={
						<Button
							onClick={ () => {
								recordTracksEvent(
									'calypso_dashboard_security_two_step_auth_actions_generate_backup_codes_click'
								);
								setShowGenerateBackupCodesDialog( true );
							} }
							variant="secondary"
							size="compact"
						>
							{ __( 'Generate new codes' ) }
						</Button>
					}
				/>
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
			<ConfirmModal
				__experimentalHideHeader={ false }
				title={ __( 'Generate new backup codes' ) }
				isOpen={ showGenerateBackupCodesDialog }
				onCancel={ () => setShowGenerateBackupCodesDialog( false ) }
				onConfirm={ () => router.navigate( { to: securityTwoStepAuthBackupCodesRoute.fullPath } ) }
				confirmButtonProps={ { label: __( 'Continue' ) } }
			>
				{ __(
					'When you generate new backup codes, you must print or download the new codes. Your previous codes will no longer work.'
				) }
			</ConfirmModal>
		</>
	);
}
