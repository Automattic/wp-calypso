import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import SecurityTwoStepAuthAppPageLayout from './page-layout';
import PrintBackupCodes from './print-backup-codes';
import ScanQRCode from './scan-qr-code';

export default function SecurityTwoStepAuthApp() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const isTwoStepAppEnabled = userSettings.two_step_app_enabled;
	const isBackupCodesPrinted = userSettings.two_step_backup_codes_printed;
	const username = userSettings.user_login;

	const showPrintBackupCodes = isTwoStepAppEnabled && ! isBackupCodesPrinted;

	return (
		<SecurityTwoStepAuthAppPageLayout>
			<VStack spacing={ 8 }>
				{ ! isTwoStepAppEnabled && (
					<Notice variant="info" title={ __( 'Before you continue' ) }>
						{ __(
							"You'll need an authenticator app like Google Authenticator or Authy installed on your device to enable two-step authentication."
						) }
					</Notice>
				) }

				{ showPrintBackupCodes ? <PrintBackupCodes username={ username } /> : <ScanQRCode /> }
			</VStack>
		</SecurityTwoStepAuthAppPageLayout>
	);
}
