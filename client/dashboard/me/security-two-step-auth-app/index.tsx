import { userSettingsQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import SecurityTwoStepAuthPageLayout from '../security-two-step-auth/common/page-layout';
import PrintBackupCodes from '../security-two-step-auth/common/print-backup-codes';
import ScanQRCode from './scan-qr-code';

export default function SecurityTwoStepAuthApp() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const isTwoStepAppEnabled = userSettings.two_step_app_enabled;
	const isBackupCodesPrinted = userSettings.two_step_backup_codes_printed;
	const username = userSettings.user_login;

	const showPrintBackupCodes = isTwoStepAppEnabled && ! isBackupCodesPrinted;

	return (
		<SecurityTwoStepAuthPageLayout>
			<VStack spacing={ 8 }>
				{ ! isTwoStepAppEnabled && (
					<Notice variant="info" title={ __( 'Before you continue' ) }>
						{ createInterpolateElement(
							__(
								'You‘ll need an authenticator app like Google Authenticator or Authy installed on your device to enable two-step authentication. <learnMoreLink>Learn more</learnMoreLink>'
							),
							{
								learnMoreLink: (
									<InlineSupportLink
										supportPostId={ 58847 }
										supportLink={ localizeUrl(
											'https://wordpress.com/support/security/two-step-authentication/#use-an-app'
										) }
									/>
								),
							}
						) }
					</Notice>
				) }

				{ showPrintBackupCodes ? <PrintBackupCodes username={ username } /> : <ScanQRCode /> }
			</VStack>
		</SecurityTwoStepAuthPageLayout>
	);
}
