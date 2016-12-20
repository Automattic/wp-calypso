/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import QueryAccountRecoverySettings from 'components/data/query-account-recovery-settings';

import MeSidebarNavigation from 'me/sidebar-navigation';
import SecuritySectionNav from 'me/security-section-nav';
import ReauthRequired from 'me/reauth-required';

import twoStepAuthorization from 'lib/two-step-authorization';
import observe from 'lib/mixins/data-observe';

import RecoveryEmail from './recovery-email';
import RecoveryPhone from './recovery-phone';

import {
	updateAccountRecoveryEmail,
	updateAccountRecoveryPhone,
	deleteAccountRecoveryPhone,
	deleteAccountRecoveryEmail,
} from 'state/account-recovery/settings/actions';

import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
	isAccountRecoverySettingsReady,
	isUpdatingAccountRecoveryEmail,
	isUpdatingAccountRecoveryPhone,
	isDeletingAccountRecoveryEmail,
	isDeletingAccountRecoveryPhone,
} from 'state/account-recovery/settings/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUser } from 'state/users/selectors';

const SecurityCheckup = React.createClass( {
	displayName: 'SecurityCheckup',

	mixins: [ observe( 'userSettings' ) ],

	componentDidMount: function() {
		this.props.userSettings.getSettings();
	},

	render: function() {
		const twoStepEnabled = this.props.userSettings.isTwoStepEnabled();

		const {
			translate,
			accountRecoverySettingsReady
		} = this.props;

		const isRecoveryEmailLoading = ! accountRecoverySettingsReady || this.props.accountRecoveryEmailActionInProgress;
		const isRecoveryPhoneLoading = ! accountRecoverySettingsReady || this.props.accountRecoveryPhoneActionInProgress;

		const twoStepNoticeMessage = translate(
			'To edit your SMS Number, go to {{a}}Two-Step Authentication{{/a}}.', {
				components: {
					a: <a href="/me/security/two-step" />
				},
			} );

		return (
			<Main className="security-checkup">
				<QueryAccountRecoverySettings />

				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<CompactCard className="security-checkup-intro">
					<p className="security-checkup-intro__text">
						{ this.props.translate( 'Keep your account safe by adding a backup email address and phone number. ' +
								'If you ever have problems accessing your account, WordPress.com will use what ' +
								'you enter here to verify your identity.' ) }
					</p>
				</CompactCard>

				<CompactCard>
					<RecoveryEmail
						primaryEmail={ this.props.primaryEmail }
						email={ this.props.accountRecoveryEmail }
						updateEmail={ this.props.updateAccountRecoveryEmail }
						deleteEmail={ this.props.deleteAccountRecoveryEmail }
						isLoading={ isRecoveryEmailLoading }
					/>
				</CompactCard>

				<CompactCard>
					<RecoveryPhone
						phone={ this.props.accountRecoveryPhone }
						updatePhone={ this.props.updateAccountRecoveryPhone }
						deletePhone={ this.props.deleteAccountRecoveryPhone }
						isLoading={ isRecoveryPhoneLoading }
						disabled={ twoStepEnabled }
					/>
					{ twoStepEnabled &&
						<Notice
							status="is-error"
							text={ twoStepNoticeMessage }
							showDismiss={ false }
						/>
					}
				</CompactCard>

			</Main>
		);
	},
} );

export default connect(
	( state ) => ( {
		accountRecoveryEmail: getAccountRecoveryEmail( state ),
		accountRecoveryEmailActionInProgress: isUpdatingAccountRecoveryEmail( state ) || isDeletingAccountRecoveryEmail( state ),
		accountRecoverySettingsReady: isAccountRecoverySettingsReady( state ),
		accountRecoveryPhone: getAccountRecoveryPhone( state ),
		accountRecoveryPhoneActionInProgress: isUpdatingAccountRecoveryPhone( state ) || isDeletingAccountRecoveryPhone( state ),
		primaryEmail: getUser( state, getCurrentUserId( state ) ).email,
	} ),
	{
		updateAccountRecoveryEmail,
		deleteAccountRecoveryEmail,
		updateAccountRecoveryPhone,
		deleteAccountRecoveryPhone,
	}
)( localize( SecurityCheckup ) );
