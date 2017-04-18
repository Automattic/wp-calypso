/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import LostPasswordForm from 'account-recovery/lost-password-form';
import ResetPasswordForm from 'account-recovery/reset-password-form';
import { ACCOUNT_RECOVERY_SLUGS as SLUGS } from 'account-recovery/constants';
import {
	isAccountRecoveryResetOptionsReady,
	getAccountRecoveryResetUserData,
} from 'state/selectors';

const getPageInfo = ( translate, slug ) => {
	const pageInfo = {
		[ SLUGS.LOST_PASSWORD ]: {
			trackerTitle: 'Account Recovery > Lost Password',
			documentHeadTitle: translate( 'Lost Password ‹ Account Recovery' ),
		},
		[ SLUGS.RESET_PASSWORD ]: {
			trackerTitle: 'Account Recovery > Reset Password',
			documentHeadTitle: translate( 'Reset Password ‹ Account Recovery' ),
		},

	};

	return pageInfo[ slug ];
};

const isUserDataReady = ( userData ) => (
	isString( userData.user ) || [ userData.firstName, userData.lastName, userData.url ].every( isString )
);

const getCurrentStep = ( { initialSlug, userData, isResetOptionsReady } ) => {
	if ( isUserDataReady( userData ) && isResetOptionsReady ) {
		return SLUGS.RESET_PASSWORD;
	}

	return initialSlug;
};

const getForm = ( slug ) => {
	switch ( slug ) {
		case SLUGS.LOST_PASSWORD:
			return <LostPasswordForm />;
		case SLUGS.RESET_PASSWORD:
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
		userData: getAccountRecoveryResetUserData( state ),
	} )
)( localize( AccountRecoveryRoot ) );
