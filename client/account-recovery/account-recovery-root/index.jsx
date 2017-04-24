/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import LostPasswordForm from 'account-recovery/lost-password-form';
import ForgotUsernameForm from 'account-recovery/forgot-username-form';
import ResetPasswordForm from 'account-recovery/reset-password-form';
import { ACCOUNT_RECOVERY_STEPS as STEPS } from 'account-recovery/constants';
import {
	isAccountRecoveryResetOptionsReady,
	isAccountRecoveryUserDataReady,
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

	};

	return pageInfo[ step ];
};

const getCurrentStep = ( { firstStep, isUserDataReady, isResetOptionsReady } ) => {
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
	} )
)( localize( AccountRecoveryRoot ) );
