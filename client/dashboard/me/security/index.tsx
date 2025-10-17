import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SecurityAccountRecoverySummary from '../security-account-recovery/summary';
import SecurityConnectedAppsSummary from '../security-connected-apps/summary';
import SecurityPasswordSummary from '../security-password/summary';
import SecuritySocialLoginsSummary from '../security-social-logins/summary';
import SecuritySshKeySummary from '../security-ssh-key/summary';
import SecurityTwoStepAuthSummary from '../security-two-step-auth/summary';

function Security() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Security' ) } /> }>
			<VStack spacing={ 6 }>
				<SecurityPasswordSummary />
				<SecurityAccountRecoverySummary />
				<SecurityTwoStepAuthSummary />
				<SecuritySshKeySummary />
				<SecurityConnectedAppsSummary />
				<SecuritySocialLoginsSummary />
			</VStack>
		</PageLayout>
	);
}

export default Security;
