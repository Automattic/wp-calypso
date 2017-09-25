/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes, kebabCase } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { ACCOUNT_RECOVERY_STEPS as STEPS } from 'account-recovery/constants';
import ForgotUsernameForm from 'account-recovery/forgot-username-form';
import LostPasswordForm from 'account-recovery/lost-password-form';
import ResetCodeValidation from 'account-recovery/reset-code-validation';
import ResetPasswordConfirmForm from 'account-recovery/reset-password-confirm-form';
import ResetPasswordEmailForm from 'account-recovery/reset-password-email-form';
import ResetPasswordForm from 'account-recovery/reset-password-form';
import ResetPasswordSmsForm from 'account-recovery/reset-password-sms-form';
import ResetPasswordSucceeded from 'account-recovery/reset-password-succeeded';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { isAccountRecoveryResetOptionsReady, isAccountRecoveryUserDataReady, isAccountRecoveryResetPasswordSucceeded, getAccountRecoveryResetSelectedMethod, getAccountRecoveryValidationKey } from 'state/selectors';

const getPageInfo = ( translate, step ) => {
	const concatHeadTitle = ( parentTitle, childTitle ) => ( parentTitle + ' ‹ ' + childTitle );

	const pageInfo = {
		[ STEPS.LOST_PASSWORD ]: {
			trackerTitle: 'Account Recovery > Lost Password',
			documentHeadTitle: concatHeadTitle( translate( 'Lost Password' ), translate( 'Account Recovery' ) ),
		},
		[ STEPS.FORGOT_USERNAME ]: {
			trackerTitle: 'Account Recovery > Forgot Username',
			documentHeadTitle: concatHeadTitle( translate( 'Forgot Username' ), translate( 'Account Recovery' ) ),
		},
		[ STEPS.RESET_PASSWORD ]: {
			trackerTitle: 'Account Recovery > Reset Password',
			documentHeadTitle: concatHeadTitle( translate( 'Reset Password' ), translate( 'Account Recovery' ) ),
		},
		[ STEPS.RESET_PASSWORD_EMAIL ]: {
			trackerTitle: 'Account Recovery > Reset Password Email',
			documentHeadTitle: concatHeadTitle( translate( 'Reset Password' ), translate( 'Email' ) ),
		},
		[ STEPS.RESET_PASSWORD_SMS ]: {
			trackerTitle: 'Account Recovery > Reset Password Sms',
			documentHeadTitle: concatHeadTitle( translate( 'Reset Password' ), translate( 'SMS Message' ) ),
		},
		[ STEPS.RESET_PASSWORD_CONFIRM ]: {
			trackerTitle: 'Account Recovery > New Password',
			documentHeadTitle: concatHeadTitle( translate( 'Reset Password' ), translate( 'New Password' ) ),
		},
		[ STEPS.RESET_PASSWORD_SUCCEEDED ]: {
			trackerTitle: 'Account Recovery > Succeeded',
			documentHeadTitle: concatHeadTitle( translate( 'Reset Password' ), translate( 'Succeeded' ) ),
		},
		[ STEPS.VALIDATE_RESET_CODE ]: {
			trackerTitle: 'Account Recovery > Validate Reset Code',
			documentHeadTitle: concatHeadTitle( translate( 'Reset Password' ), translate( 'Validating' ) ),
		},
	};

	return pageInfo[ step ];
};

const getCurrentStep = ( props ) => {
	const {
		firstStep,
		isUserDataReady,
		isResetOptionsReady,
		isResetPasswordSucceeded,
		selectedMethod,
		validationKey,
	} = props;

	if ( isResetPasswordSucceeded ) {
		return STEPS.RESET_PASSWORD_SUCCEEDED;
	}

	if ( validationKey ) {
		return STEPS.RESET_PASSWORD_CONFIRM;
	}

	if ( selectedMethod ) {
		if ( includes( [ 'primary_email', 'secondary_email' ], selectedMethod ) ) {
			return STEPS.RESET_PASSWORD_EMAIL;
		}

		return STEPS.RESET_PASSWORD_SMS;
	}

	if ( isUserDataReady && isResetOptionsReady ) {
		return STEPS.RESET_PASSWORD;
	}

	return firstStep;
};

const getForm = ( step ) => {
	switch ( step ) {
		case STEPS.LOST_PASSWORD:
			return <LostPasswordForm />;
		case STEPS.FORGOT_USERNAME:
			return <ForgotUsernameForm />;
		case STEPS.RESET_PASSWORD:
			return <ResetPasswordForm />;
		case STEPS.RESET_PASSWORD_EMAIL:
			return <ResetPasswordEmailForm />;
		case STEPS.RESET_PASSWORD_SMS:
			return <ResetPasswordSmsForm />;
		case STEPS.RESET_PASSWORD_CONFIRM:
			return <ResetPasswordConfirmForm />;
		case STEPS.RESET_PASSWORD_SUCCEEDED:
			return <ResetPasswordSucceeded />;
		case STEPS.VALIDATE_RESET_CODE:
			return <ResetCodeValidation />;
	}

	return null;
};

const AccountRecoveryRoot = ( props ) => {
	const {
		className,
		translate,
		basePath,
	} = props;

	const currentStep = getCurrentStep( props );
	const { trackerTitle, documentHeadTitle } = getPageInfo( translate, currentStep );

	return (
		<Main className={ classnames( 'account-recovery-form', className, kebabCase( currentStep ) ) }>
			<PageViewTracker path={ basePath } title={ trackerTitle } />
			<DocumentHead title={ documentHeadTitle } />
			{ getForm( currentStep ) }
		</Main>
	);
};

export default connect(
	( state ) => ( {
		isResetOptionsReady: isAccountRecoveryResetOptionsReady( state ),
		isUserDataReady: isAccountRecoveryUserDataReady( state ),
		isResetPasswordSucceeded: isAccountRecoveryResetPasswordSucceeded( state ),
		selectedMethod: getAccountRecoveryResetSelectedMethod( state ),
		validationKey: getAccountRecoveryValidationKey( state ),
	} )
)( localize( AccountRecoveryRoot ) );
