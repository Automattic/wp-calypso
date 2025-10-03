import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAccountRecoverySettings from 'calypso/components/data/query-account-recovery-settings';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import {
	updateAccountRecoveryEmail,
	updateAccountRecoveryPhone,
	deleteAccountRecoveryPhone,
	deleteAccountRecoveryEmail,
	resendAccountRecoveryEmailValidation,
	resendAccountRecoveryPhoneValidation,
	validateAccountRecoveryPhone,
} from 'calypso/state/account-recovery/settings/actions';
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
} from 'calypso/state/account-recovery/settings/selectors';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import RecoveryEmail from './recovery-email';
import RecoveryEmailValidationNotice from './recovery-email-validation-notice';
import RecoveryPhone from './recovery-phone';
import RecoveryPhoneValidationNotice from './recovery-phone-validation-notice';

import './style.scss';

const SecurityAccountRecovery = ( props ) => (
	<Main wideLayout className="security security-account-recovery">
		<PageViewTracker path="/me/security/account-recovery" title="Me > Account Recovery" />
		<QueryAccountRecoverySettings />

		<NavigationHeader navigationItems={ [] } title={ props.translate( 'Security' ) } />

		{ ! config.isEnabled( 'security/security-checkup' ) && (
			<SecuritySectionNav path={ props.path } />
		) }
		{ config.isEnabled( 'security/security-checkup' ) && (
			<HeaderCake backText={ props.translate( 'Back' ) } backHref="/me/security">
				{ props.translate( 'Account Recovery' ) }
			</HeaderCake>
		) }

		<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

		<DocumentHead title={ props.translate( 'Account Recovery' ) } />

		<Card>
			<p className="security-account-recovery__text">
				{ props.translate(
					'Keep your account safe by adding a backup email address and phone number. ' +
						'If you ever have problems accessing your account, WordPress.com will use what ' +
						'you enter here to verify your identity.'
				) }
			</p>
		</Card>

		<div className="security-account-recovery__recovery-email">
			<SectionHeader label={ props.translate( 'Recovery email address' ) } />
			<Card>
				{ props.shouldPromptEmailValidationNotice && ! props.hasSentEmailValidation && (
					<RecoveryEmailValidationNotice
						onResend={ props.resendAccountRecoveryEmailValidation }
						hasSent={ props.hasSentEmailValidation }
					/>
				) }
				<RecoveryEmail
					primaryEmail={ props.primaryEmail }
					email={ props.accountRecoveryEmail }
					updateEmail={ props.updateAccountRecoveryEmail }
					deleteEmail={ props.deleteAccountRecoveryEmail }
					isLoading={ props.accountRecoveryEmailActionInProgress }
				/>
			</Card>
		</div>

		<div className="security-account-recovery__recovery-sms-number">
			<SectionHeader label={ props.translate( 'Recovery SMS number' ) } />
			<Card>
				<RecoveryPhone
					phone={ props.accountRecoveryPhone }
					updatePhone={ props.updateAccountRecoveryPhone }
					deletePhone={ props.deleteAccountRecoveryPhone }
					isLoading={ props.accountRecoveryPhoneActionInProgress }
					isUpdateMode={ props.shouldPromptPhoneValidationNotice }
				/>
				{ props.shouldPromptPhoneValidationNotice && (
					<RecoveryPhoneValidationNotice
						onResend={ props.resendAccountRecoveryPhoneValidation }
						onValidate={ props.validateAccountRecoveryPhone }
						hasSent={ props.hasSentPhoneValidation }
						isValidating={ props.validatingAccountRecoveryPhone }
					/>
				) }
			</Card>
		</div>
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
