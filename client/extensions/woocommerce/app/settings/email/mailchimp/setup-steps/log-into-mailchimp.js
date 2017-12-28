/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import { translate } from 'i18n-calypso';

export default () => (
	<div>
		<p>
			{ translate( 'To get started, you need a MailChimp account. Please log in or register by clicking the button below.' ) }
		</p>
		<Button
			href="https://login.mailchimp.com/"
			target="_blank"
			className="setup-steps__mailchimp-login-button" >
			{ translate( 'Sign up or log in to MailChimp' ) }
			<Gridicon icon="external" />
		</Button>
	</div>
);
