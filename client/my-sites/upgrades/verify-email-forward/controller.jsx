/**
 * External dependencies
 */
import React from 'react';
import { Base64 } from 'js-base64';

/**
 * Internal dependencies
 */
import i18nUtils from 'lib/i18n-utils';
import VerifyEmailForward from './verify-email-forward';

export function verifyEmailForward( context, next ) {
	const { mailbox, destination } = JSON.parse( Base64.decode( context.params.mailbox_base64 ) );
	context.primary = (
		<VerifyEmailForward
			domainEmailId={ context.params.domain_email_id }
			mailbox={ mailbox }
			destination={ destination }
			locale={ i18nUtils.getLanguage( context.params.locale ) }
			nonce={ context.params.nonce }
			path={ context.path }
		/>
	);
	context.secondary = null;
	next();
}
