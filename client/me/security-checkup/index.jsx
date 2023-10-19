import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAccountRecoverySettings from 'calypso/components/data/query-account-recovery-settings';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import VerticalNav from 'calypso/components/vertical-nav';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import SecurityCheckupAccountEmail from './account-email';
import SecurityCheckupAccountRecoveryEmail from './account-recovery-email';
import SecurityCheckupAccountRecoveryPhone from './account-recovery-phone';
import SecurityCheckupConnectedApplications from './connected-applications';
import SecurityCheckupPassword from './password';
import SecurityCheckupSocialLogins from './social-logins';
import { SecurityCheckupSSHKey } from './ssh-key';
import SecurityCheckupTwoFactorAuthentication from './two-factor-authentication';
import SecurityCheckupTwoFactorBackupCodes from './two-factor-backup-codes';

import './style.scss';

class SecurityCheckupComponent extends Component {
	static propTypes = {
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { path, translate } = this.props;

		return (
			<Main wideLayout className="security security-checkup">
				<PageViewTracker path={ path } title="Me > Security Checkup" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<QueryAccountRecoverySettings />
				<QueryUserSettings />

				<DocumentHead title={ translate( 'Security' ) } />

				<NavigationHeader navigationItems={ [] } title={ translate( 'Security' ) } />

				<SectionHeader label={ translate( 'Security Checklist' ) } />

				<VerticalNav>
					<SecurityCheckupPassword />
					<SecurityCheckupAccountEmail />
					<SecurityCheckupTwoFactorAuthentication />
					<SecurityCheckupTwoFactorBackupCodes />
					<SecurityCheckupAccountRecoveryEmail />
					<SecurityCheckupAccountRecoveryPhone />
					<SecurityCheckupSSHKey />
				</VerticalNav>

				<SectionHeader label={ translate( 'Connections' ) } className="security-checkup__info" />
				<VerticalNav className="security-checkup__info-nav">
					<SecurityCheckupConnectedApplications />
					<SecurityCheckupSocialLogins />
				</VerticalNav>
			</Main>
		);
	}
}

export default localize( SecurityCheckupComponent );
