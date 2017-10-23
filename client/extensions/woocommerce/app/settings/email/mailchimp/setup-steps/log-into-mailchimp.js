/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { translate } from 'i18n-calypso';

export default () => (
	<div>
		<div className="setup-steps__login-title">{ translate( 'Get started' ) }</div>
		<p>
			{ translate( 'First, you\'ll have to have a MailChimp account. If you already have one, log in.' ) }
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
