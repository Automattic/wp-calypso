/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const ResetPasswordSucceeded = ( props ) => {
	const { translate } = props;

	return (
		<Card>
			<p>{ translate( 'Congratulations! Your password has been reset.' ) }</p>
			<a href={ config( 'login_url' ) }>{ translate( 'Log in' ) }</a>
		</Card>
	);
};

export default localize( ResetPasswordSucceeded );
