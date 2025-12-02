import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../../../components/card';
import Notice from '../../../../components/notice';
import { SectionHeader } from '../../../../components/section-header';
import VerifyCodeForm from '../../common/verify-code-form';

export default function BackupCodes() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const isBackupCodesPrinted = userSettings.two_step_backup_codes_printed;

	const { createErrorNotice } = useDispatch( noticesStore );

	return (
		<>
			<SectionHeader
				level={ 2 }
				title={ __( 'Backup codes' ) }
				description={ __(
					'Backup codes let you access your account if you lose your phone or can’t use your authenticator app. Each code can only be used once.'
				) }
			/>
			{ isBackupCodesPrinted ? (
				<Notice variant="success">{ __( 'Backup codes have been verified.' ) }</Notice>
			) : (
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
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
						</VStack>
					</CardBody>
				</Card>
			) }
		</>
	);
}
