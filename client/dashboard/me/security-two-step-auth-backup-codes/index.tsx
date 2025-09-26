import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PrintBackupCodes from '../security-two-step-auth/common/print-backup-codes';

export default function SecurityTwoStepAuthBackupCodes() {
	const router = useRouter();

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const username = userSettings.user_login;

	// TODO: Replace with breadcrumb
	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( { to: '/me/security/two-step-auth' } );
			} }
		>
			{ __( 'Security' ) }
		</Button>
	);
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ backButton }
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
