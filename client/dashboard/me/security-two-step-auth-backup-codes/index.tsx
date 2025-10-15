import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PrintBackupCodes from '../security-two-step-auth/common/print-backup-codes';

export default function SecurityTwoStepAuthBackupCodes() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const username = userSettings.user_login;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Backup codes' ) }
					description={ __(
						'Backup codes let you access your account if you lose your phone or can’t use your authenticator app. Each code can only be used once. Store them in a safe place.'
					) }
				/>
			}
		>
			<PrintBackupCodes hideVerifyBackupCodesHeader username={ username } />
		</PageLayout>
	);
}
