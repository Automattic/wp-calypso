/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import LostPasswordForm from 'account-recovery/lost-password-form';
import ForgotUsernameForm from 'account-recovery/forgot-username-form';
import ResetPasswordForm from 'account-recovery/reset-password-form';
import ResetPasswordEmailForm from 'account-recovery/reset-password-email-form';
import ResetPasswordSmsForm from 'account-recovery/reset-password-sms-form';
import { ACCOUNT_RECOVERY_STEPS as STEPS } from 'account-recovery/constants';
import {
	isAccountRecoveryResetOptionsReady,
	isAccountRecoveryUserDataReady,
	getAccountRecoveryResetSelectedMethod,
} from 'state/selectors';

const getPageInfo = ( translate, step ) => {
	const pageInfo = {
		[ STEPS.LOST_PASSWORD ]: {
			trackerTitle: 'Account Recovery > Lost Password',
			documentHeadTitle: translate( 'Lost Password ‹ Account Recovery' ),
		},
		[ STEPS.FORGOT_USERNAME ]: {
			trackerTitle: 'Account Recovery > Forgot Username',
			documentHeadTitle: translate( 'Forgot Username ‹ Account Recovery' ),
		},
		[ STEPS.RESET_PASSWORD ]: {
			trackerTitle: 'Account Recovery > Reset Password',
			documentHeadTitle: translate( 'Reset Password ‹ Account Recovery' ),
		},
		[ STEPS.RESET_PASSWORD_EMAIL ]: {
			trackerTitle: 'Account Recovery > Reset Password Email',
			documentHeadTitle: translate( 'Reset Password < Email' ),
		},
		[ STEPS.RESET_PASSWORD_SMS ]: {
			trackerTitle: 'Account Recovery > Reset Password Sms',
			documentHeadTitle: translate( 'Reset Password ‹ SMS Message' ),
		},
	};

	return pageInfo[ step ];
};

const getCurrentStep = ( props ) => {
	const {
		firstStep,
		isUserDataReady,
		isResetOptionsReady,
		selectedMethod,
	} = props;

	if ( selectedMethod ) {
		if ( includes( selectedMethod, '_email' ) ) {
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
		<Main className={ classnames( 'account-recovery-form', className ) }>
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
		selectedMethod: getAccountRecoveryResetSelectedMethod( state ),
	} )
)( localize( AccountRecoveryRoot ) );
