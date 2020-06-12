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
import SectionHeader from 'components/section-header';
import SecurityCheckupAccountEmail from './account-email';
import SecurityCheckupAccountRecoveryEmail from './account-recovery-email';
import SecurityCheckupAccountRecoveryPhone from './account-recovery-phone';
import SecurityCheckupConnectedApplications from './connected-applications';
import SecurityCheckupSocialLogins from './social-logins';
import SecurityCheckupTwoFactorAuthentication from './two-factor-authentication';
import SecurityCheckupTwoFactorBackupCodes from './two-factor-backup-codes';
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

	renderInfoCard() {
		const { translate } = this.props;
		return (
			<Card compact={ true } className="security-checkup__title-card security-checkup__info">
				<div className="security-checkup__title-text">
					<h3>{ translate( "Here are some more ways you're using your account" ) }</h3>
				</div>
			</Card>
		);
	}

	renderTitleCard() {
		const { translate } = this.props;
		return (
			<Card compact={ true } className="security-checkup__title-card">
				<h4>{ translate( 'How secure is your account?' ) }</h4>
				<div className="security-checkup__title-text">
					{ translate(
						'Review these important settings to keep your information accurate and to make your account more secure.'
					) }
				</div>
			</Card>
		);
	}

	render() {
		const { path, translate } = this.props;

		return (
			<Main className="security security-checkup">
				<PageViewTracker path={ path } title="Me > Security Checkup" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<MeSidebarNavigation />

				<DocumentHead title={ translate( 'Security' ) } />

				<SectionHeader label={ translate( 'Security' ) } />
				{ this.renderTitleCard() }
				<VerticalNav>
					<SecurityCheckupAccountEmail />
					<SecurityCheckupTwoFactorAuthentication />
					<SecurityCheckupTwoFactorBackupCodes />
					<SecurityCheckupAccountRecoveryEmail />
					<SecurityCheckupAccountRecoveryPhone />
				</VerticalNav>

				{ this.renderInfoCard() }
				<VerticalNav className="security-checkup__info-nav">
					<SecurityCheckupSocialLogins />
					<SecurityCheckupConnectedApplications />
				</VerticalNav>
			</Main>
		);
	}
}

export default localize( SecurityCheckupComponent );
