/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const AccountRecoveryErrorMessage = ( props ) => (
	<p className="account-recovery-error-message">
		{ props.translate(
			"We're having trouble connecting to our servers at the moment. " +
			'Please try again later. If the problem persists, please {{a}}contact us{{/a}}.',
			{ components: {
				a: <a href="https://wordpress.com/wp-login.php?action=recovery" target="_blank" rel="noopener noreferrer" />
			} }
		) }
	</p>
);

export default localize( AccountRecoveryErrorMessage );
