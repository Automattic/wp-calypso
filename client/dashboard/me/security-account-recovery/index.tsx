import { __ } from '@wordpress/i18n';
import ComponentViewTracker from '../../components/component-view-tracker';
import PageLayout from '../../components/page-layout';
import SecurityPageHeader from '../security-page-header';
import RecoveryEmail from './recovery-email';
import RecoverySMS from './recovery-sms';

export default function SecurityAccountRecovery() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Account recovery' ) }
					description={ __(
						'If you ever have problems accessing your account, WordPress.com will use what you enter here to verify your identity.'
					) }
				/>
			}
		>
			<ComponentViewTracker eventName="calypso_dashboard_security_account_recovery_page_view" />
			<RecoveryEmail />
			<RecoverySMS />
		</PageLayout>
	);
}
