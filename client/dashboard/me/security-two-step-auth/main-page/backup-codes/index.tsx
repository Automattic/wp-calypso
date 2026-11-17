import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { securityTwoStepAuthBackupCodesRoute } from '../../../../app/router/me';
import { ActionList } from '../../../../components/action-list';
import { Card, CardBody } from '../../../../components/card';
import ConfirmModal from '../../../../components/confirm-modal';
import { SectionHeader } from '../../../../components/section-header';
import VerifyCodeForm from '../../common/verify-code-form';

export default function BackupCodes() {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const isBackupCodesPrinted = userSettings.two_step_backup_codes_printed;
	const [ showGenerateDialog, setShowGenerateDialog ] = useState( false );

	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );

	const title = __( 'Backup codes' );
	const description = __(
		'Backup codes let you access your account if you lose your phone or can’t use your authenticator app. Each code can only be used once.'
	);
	const generateButton = (
		<Button
			variant="secondary"
			size="compact"
			onClick={ () => {
				recordTracksEvent(
					'calypso_dashboard_security_two_step_auth_actions_generate_backup_codes_click'
				);
				setShowGenerateDialog( true );
			} }
		>
			{ __( 'Generate new codes' ) }
		</Button>
	);

	return (
		<>
			{ isBackupCodesPrinted ? (
				<ActionList>
					<ActionList.ActionItem
						title={
							<HStack justify="flex-start" spacing={ 2 } as="span" wrap>
								<span>{ title }</span>
								<Badge intent="stable">{ __( 'Verified' ) }</Badge>
							</HStack>
						}
						description={ description }
						actions={ generateButton }
					/>
				</ActionList>
			) : (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="top" spacing={ 6 }>
								<SectionHeader level={ 3 } title={ title } description={ description } />
								<VStack style={ { flexShrink: 0 } }>{ generateButton }</VStack>
							</HStack>
							<VerifyCodeForm
								showCancelButton={ false }
								primaryButtonText={ __( 'Verify' ) }
								customField={ {
									label: __( 'Type a backup code to verify' ),
									placeholder: '12345678',
								} }
								actionType="create-backup-receipt"
								onSuccess={ () => {
									createSuccessNotice( __( 'Backup codes verified.' ), {
										type: 'snackbar',
									} );
								} }
								onError={ () => {
									createErrorNotice( __( 'Failed to verify backup codes.' ), {
										type: 'snackbar',
									} );
								} }
								infoNoticeText={ __(
									'New backup codes have been generated, but need to be verified.'
								) }
							/>
						</VStack>
					</CardBody>
				</Card>
			) }
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
		</>
	);
}
