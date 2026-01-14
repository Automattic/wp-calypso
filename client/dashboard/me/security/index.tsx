import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SecurityAccountRecoverySummary from '../security-account-recovery/summary';
import SecurityConnectedAppsSummary from '../security-connected-apps/summary';
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
			<VStack spacing={ 6 }>
				<SecurityPasswordSummary />
				<SecurityAccountRecoverySummary />
				<SecurityTwoStepAuthSummary />
				{ supportsSecurity.sshKey && <SecuritySshKeySummary /> }
				<SecurityConnectedAppsSummary />
				<SecuritySocialLoginsSummary />
			</VStack>
		</PageLayout>
	);
}

export default Security;
