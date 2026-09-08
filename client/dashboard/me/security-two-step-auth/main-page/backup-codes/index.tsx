import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { securityTwoStepAuthBackupCodesRoute } from '../../../../app/router/me';
import { Card, CardBody } from '../../../../components/card';
import ConfirmModal from '../../../../components/confirm-modal';
import Notice from '../../../../components/notice';
import { SectionHeader } from '../../../../components/section-header';
import VerifyCodeForm from '../../common/verify-code-form';

export default function BackupCodes() {
	const router = useRouter();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const isBackupCodesPrinted = userSettings.two_step_backup_codes_printed;
	const [ showGenerateDialog, setShowGenerateDialog ] = useState( false );

	const { createErrorNotice } = useDispatch( noticesStore );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Backup codes' ) }
						description={ __(
							'Backup codes let you access your account if you lose your phone or can’t use your authenticator app. Each code can only be used once.'
						) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ () => setShowGenerateDialog( true ) }
							>
								{ __( 'Generate new codes' ) }
							</Button>
						}
					/>
					{ isBackupCodesPrinted ? (
						<Notice variant="success">{ __( 'Backup codes have been verified.' ) }</Notice>
					) : (
						<VerifyCodeForm
							showCancelButton={ false }
							primaryButtonText={ __( 'Verify' ) }
							customField={ {
								label: __( 'Type a backup code to verify' ),
								placeholder: '12345678',
							} }
							actionType="create-backup-receipt"
							onError={ () => {
								createErrorNotice( __( 'Failed to verify backup codes.' ), {
									type: 'snackbar',
								} );
							} }
							infoNoticeText={ __(
								'New backup codes have been generated, but need to be verified.'
							) }
						/>
					) }
				</VStack>
			</CardBody>
			<ConfirmModal
				__experimentalHideHeader={ false }
				title={ __( 'Generate new backup codes' ) }
				isOpen={ showGenerateDialog }
				onCancel={ () => setShowGenerateDialog( false ) }
				onConfirm={ () => router.navigate( { to: securityTwoStepAuthBackupCodesRoute.fullPath } ) }
				confirmButtonProps={ { label: __( 'Continue' ) } }
			>
				{ __(
					'When you generate new backup codes, you must print or download the new codes. Your previous codes will no longer work.'
				) }
			</ConfirmModal>
		</Card>
	);
}
