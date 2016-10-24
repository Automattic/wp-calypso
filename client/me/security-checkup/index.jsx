/**
 * External dependencies
 */
import React, { Component } from 'react';
import observe from 'lib/mixins/data-observe';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import CompactCard from 'components/card/compact';
import SecuritySectionNav from 'me/security-section-nav';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import RecoveryEmail from './recovery-email';
import RecoveryPhone from './recovery-phone';

class SecurityCheckup extends Component {
	componentDidMount() {
		this.props.userSettings.getSettings();
	}

	render() {
		return (
			<Main className="security-checkup">
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<CompactCard className="security-checkup-intro">
					<p className="security-checkup-intro__text">
						{ translate( 'Keep your account safe by adding a backup email address and phone number. If you ever have problems accessing your account, WordPress.com will use what you enter here to verify your identity.' ) }
					</p>
				</CompactCard>

				<CompactCard>
					<RecoveryEmail userSettings={ this.props.userSettings } />
				</CompactCard>

				<CompactCard>
					<RecoveryPhone userSettings={ this.props.userSettings } />
				</CompactCard>

			</Main>
		);
	}
}

SecurityCheckup.displayName = 'SecurityCheckup';

SecurityCheckup.mixins = [ observe( 'userSettings' ) ];

export default SecurityCheckup;
