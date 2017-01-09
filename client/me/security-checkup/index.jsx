/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import CompactCard from 'components/card/compact';
import QueryAccountRecoverySettings from 'components/data/query-account-recovery-settings';
import MeSidebarNavigation from 'me/sidebar-navigation';
import SecuritySectionNav from 'me/security-section-nav';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import RecoveryEmail from './recovery-email';
import RecoveryPhone from './recovery-phone';
import RecoveryEmailValidationNotice from './recovery-email-validation-notice';
import RecoveryPhoneValidationNotice from './recovery-phone-validation-notice';

import {
	updateAccountRecoveryEmail,
	updateAccountRecoveryPhone,
	deleteAccountRecoveryPhone,
	deleteAccountRecoveryEmail,
	resendAccountRecoveryEmailValidation,
	resendAccountRecoveryPhoneValidation,
	validateAccountRecoveryPhone,
} from 'state/account-recovery/settings/actions';

import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
	isAccountRecoveryEmailActionInProgress,
	isAccountRecoveryPhoneActionInProgress,
	isValidatingAccountRecoveryPhone,
	isAccountRecoveryEmailValidated,
	isAccountRecoveryPhoneValidated,
	hasSentAccountRecoveryEmailValidation,
	hasSentAccountRecoveryPhoneValidation,
	shouldPromptAccountRecoveryEmailValidationNotice,
	shouldPromptAccountRecoveryPhoneValidationNotice,
} from 'state/account-recovery/settings/selectors';

import { getCurrentUserEmail } from 'state/current-user/selectors';

class SecurityCheckup extends Component {
	render() {
		return (
			<Main className="security-checkup">
				<QueryAccountRecoverySettings />

				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<CompactCard>
					<p className="security-checkup__text">
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
						isLoading={ this.props.accountRecoveryEmailActionInProgress }
					/>
					{ this.props.shouldPromptEmailValidationNotice &&
						<RecoveryEmailValidationNotice
							onResend={ this.props.resendAccountRecoveryEmailValidation }
							hasSent={ this.props.hasSentEmailValidation }
						/>
					}
				</CompactCard>

				<CompactCard>
					<RecoveryPhone
						phone={ this.props.accountRecoveryPhone }
						updatePhone={ this.props.updateAccountRecoveryPhone }
						deletePhone={ this.props.deleteAccountRecoveryPhone }
						isLoading={ this.props.accountRecoveryPhoneActionInProgress }
					/>
					{ this.props.shouldPromptPhoneValidationNotice &&
						<RecoveryPhoneValidationNotice
							onResend={ this.props.resendAccountRecoveryPhoneValidation }
							onValidate={ this.props.validateAccountRecoveryPhone }
							hasSent={ this.props.hasSentPhoneValidation }
							isValidating={ this.props.validatingAccountRecoveryPhone }
						/>
					}
				</CompactCard>

			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		accountRecoveryEmail: getAccountRecoveryEmail( state ),
		accountRecoveryEmailActionInProgress: isAccountRecoveryEmailActionInProgress( state ),
		accountRecoveryEmailValidated: isAccountRecoveryEmailValidated( state ),
		hasSentEmailValidation: hasSentAccountRecoveryEmailValidation( state ),
		primaryEmail: getCurrentUserEmail( state ),
		shouldPromptEmailValidationNotice: shouldPromptAccountRecoveryEmailValidationNotice( state ),
		accountRecoveryPhone: getAccountRecoveryPhone( state ),
		accountRecoveryPhoneActionInProgress: isAccountRecoveryPhoneActionInProgress( state ),
		accountRecoveryPhoneValidated: isAccountRecoveryPhoneValidated( state ),
		validatingAccountRecoveryPhone: isValidatingAccountRecoveryPhone( state ),
		hasSentPhoneValidation: hasSentAccountRecoveryPhoneValidation( state ),
		shouldPromptPhoneValidationNotice: shouldPromptAccountRecoveryPhoneValidationNotice( state ),
	} ),
	{
		updateAccountRecoveryEmail,
		deleteAccountRecoveryEmail,
		updateAccountRecoveryPhone,
		deleteAccountRecoveryPhone,
		resendAccountRecoveryEmailValidation,
		resendAccountRecoveryPhoneValidation,
		validateAccountRecoveryPhone,
	}
)( localize( SecurityCheckup ) );
