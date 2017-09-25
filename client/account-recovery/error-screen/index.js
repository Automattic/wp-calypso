/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { ACCOUNT_RECOVERY_ERROR_CODE as ERROR_CODE } from 'account-recovery/constants';
import EmptyContent from 'components/empty-content';
import config from 'config';

const getErrorContent = ( errorIdentifier, translate ) => {
	switch ( errorIdentifier ) {
		case ERROR_CODE.INVALID_KEY:
			return {
				title: translate( "We've failed to validate using the given link." ),
				line: translate( 'Please try to request a new one or try the other methods.' ),
				action: translate( 'Continue' ),
				actionURL: '/account-recovery/',
			};
	}

	return {
		title: translate( "We've run into an unexpected error. We're sorry! " ),
		line: translate( 'Contact WordPress.com Support and one of our Happiness Engineers will get you back on track.' ),
		action: translate( 'Contact us' ),
		actionURL: config( 'login_url' ) + '?action=recovery',
	};
};

const AccountRecoveryErrorScreen = ( props ) => {
	const {
		title,
		line,
		action,
		actionURL,
	} = getErrorContent( props.error.name, props.translate );

	return (
		<EmptyContent
			illustration="/calypso/images/illustrations/illustration-500.svg"
			title={ title }
			line={ line }
			action={ action }
			actionURL={ actionURL }
		/>
	);
};

export default localize( AccountRecoveryErrorScreen );
