import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import SecurityTwoStepAuthPageLayout from '../security-two-step-auth/common/page-layout';
import PrintBackupCodes from '../security-two-step-auth/common/print-backup-codes';
import SetupPhoneNumber from './setup-phone-number';

export default function SecurityTwoStepAuthSMS() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const isTwoStepSMSEnabled = userSettings.two_step_sms_enabled;
	const isBackupCodesPrinted = userSettings.two_step_backup_codes_printed;
	const showPrintBackupCodes = isTwoStepSMSEnabled && ! isBackupCodesPrinted;

	const username = userSettings.user_login;

	return (
		<SecurityTwoStepAuthPageLayout>
			{ showPrintBackupCodes ? (
				<PrintBackupCodes username={ username } />
			) : (
				<SetupPhoneNumber userSettings={ userSettings } />
			) }
		</SecurityTwoStepAuthPageLayout>
	);
}
