/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import CompactCard from 'components/card/compact';
import QueryPreferences from 'components/data/query-preferences';
import SecuritySectionNav from 'me/security-section-nav';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import observe from 'lib/mixins/data-observe';
import RecoveryEmail from './recovery-email';
import RecoveryPhone from './recovery-phone';

const SecurityCheckup = React.createClass( {
	displayName: 'SecurityCheckup',

	mixins: [ observe( 'userSettings' ) ],

	componentDidMount: function() {
		this.props.userSettings.getSettings();
	},

	render: function() {
		return (
			<Main className="security-checkup">
				<QueryPreferences />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<CompactCard className="security-checkup-intro">
					<p className="security-checkup-intro__text">
						{ this.translate( 'Keep your account safe by adding a backup email address and phone number.' +
								'If you ever have problems accessing your account, WordPress.com will use what ' +
								'you enter here to verify your identity.' ) }
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
	},
} );

export default localize( SecurityCheckup );
