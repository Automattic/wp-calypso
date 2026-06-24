import { isEnabled } from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SummaryButtonList } from '../../components/summary-button-list';
import SecurityAccountRecoverySummary from '../security-account-recovery/summary';
import SecurityConnectedAppsSummary from '../security-connected-apps/summary';
import SecurityLegacyContactSummary from '../security-legacy-contact/summary';
import SecurityPasswordSummary from '../security-password/summary';
import SecuritySocialLoginsSummary from '../security-social-logins/summary';
import SecuritySshKeySummary from '../security-ssh-key/summary';
import SecurityTwoStepAuthSummary from '../security-two-step-auth/summary';

function Security() {
	const { supports } = useAppContext();
	const supportsSecurity = supports.me && supports.me.security;

	if ( ! supportsSecurity ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Security' ) }
					description={ __( 'Manage your account security settings and authentication methods.' ) }
				/>
			}
		>
			<SummaryButtonList>
				<SecurityPasswordSummary />
				<SecurityAccountRecoverySummary />
				<SecurityTwoStepAuthSummary />
				{ supportsSecurity.sshKey ? <SecuritySshKeySummary /> : null }
				<SecurityConnectedAppsSummary />
				<SecuritySocialLoginsSummary />
				{ isEnabled( 'me/legacy-contact' ) ? <SecurityLegacyContactSummary /> : null }
			</SummaryButtonList>
			<PerformanceTrackerStop />
		</PageLayout>
	);
}

export default Security;
