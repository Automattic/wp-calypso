/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ReauthRequired from 'me/reauth-required';
import SecurityCheckupAccountEmail from './account-email';
import SecurityCheckupAccountRecoveryEmail from './account-recovery-email';
import SecurityCheckupAccountRecoveryPhone from './account-recovery-phone';
import SecurityCheckupConnectedApplications from './connected-applications';
import SecurityCheckupTwoFactorAuthentication from './two-factor-authentication';
import SecurityCheckupTwoFactorBackupCodes from './two-factor-backup-codes';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import VerticalNav from 'components/vertical-nav';

/**
 * Style dependencies
 */
import './style.scss';

class SecurityCheckupComponent extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	renderTitleCard() {
		const { translate } = this.props;
		return (
			<Card compact={ true } className="security-checkup__title-card">
				<h2>{ translate( 'Security Checkup' ) }</h2>
				<div className="security-checkup__title-text">
					{ translate(
						'Please review this summary of your account security and recovery settings'
					) }
				</div>
			</Card>
		);
	}

	render() {
		const { path, translate } = this.props;

		return (
			<Main className="security security-checkup">
				<PageViewTracker path="/me/security/security-checkup" title="Me > Security Checkup" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<MeSidebarNavigation />

				<DocumentHead title={ translate( 'Security Checkup' ) } />

				<SecuritySectionNav path={ path } />

				{ this.renderTitleCard() }
				<VerticalNav>
					<SecurityCheckupAccountEmail />
					<SecurityCheckupTwoFactorAuthentication />
					<SecurityCheckupTwoFactorBackupCodes />
					<SecurityCheckupAccountRecoveryEmail />
					<SecurityCheckupAccountRecoveryPhone />
					<SecurityCheckupConnectedApplications />
				</VerticalNav>
			</Main>
		);
	}
}

export default localize( SecurityCheckupComponent );
