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

const SecurityAccountRecovery = ( props ) => (
	<Main className="security-account-recovery">
		<QueryAccountRecoverySettings />

		<MeSidebarNavigation />

		<SecuritySectionNav path={ props.path } />

		<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

		<CompactCard>
			<p className="security-account-recovery__text">
				{ props.translate( 'Keep your account safe by adding a backup email address and phone number. ' +
						'If you ever have problems accessing your account, WordPress.com will use what ' +
						'you enter here to verify your identity.' ) }
			</p>
		</CompactCard>

		<CompactCard>
			<RecoveryEmail
				primaryEmail={ props.primaryEmail }
				email={ props.accountRecoveryEmail }
				updateEmail={ props.updateAccountRecoveryEmail }
				deleteEmail={ props.deleteAccountRecoveryEmail }
				isLoading={ props.accountRecoveryEmailActionInProgress }
			/>
			{ props.shouldPromptEmailValidationNotice &&
				<RecoveryEmailValidationNotice
					onResend={ props.resendAccountRecoveryEmailValidation }
					hasSent={ props.hasSentEmailValidation }
				/>
			}
		</CompactCard>

		<CompactCard>
			<RecoveryPhone
				phone={ props.accountRecoveryPhone }
				updatePhone={ props.updateAccountRecoveryPhone }
				deletePhone={ props.deleteAccountRecoveryPhone }
				isLoading={ props.accountRecoveryPhoneActionInProgress }
			/>
			{ props.shouldPromptPhoneValidationNotice &&
				<RecoveryPhoneValidationNotice
					onResend={ props.resendAccountRecoveryPhoneValidation }
					onValidate={ props.validateAccountRecoveryPhone }
					hasSent={ props.hasSentPhoneValidation }
					isValidating={ props.validatingAccountRecoveryPhone }
				/>
			}
		</CompactCard>
	</Main>
);

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
)( localize( SecurityAccountRecovery ) );
