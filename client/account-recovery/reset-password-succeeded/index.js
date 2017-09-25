/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import config from 'config';

const ResetPasswordSucceeded = ( props ) => {
	const { translate } = props;

	return (
		<EmptyContent
			illustration="/calypso/images/illustrations/illustration-ok.svg"
			title={ translate( 'Congratulations!' ) }
			line={ translate( 'Your password has been reset.' ) }
			action={ translate( 'Log in' ) }
			actionURL={ config( 'login_url' ) }
		/>
    );
};

export default localize( ResetPasswordSucceeded );
