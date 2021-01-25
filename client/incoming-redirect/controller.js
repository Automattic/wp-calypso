/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import TitanRedirector from 'calypso/my-sites/email/titan-redirector';
import EmptyContent from 'calypso/components/empty-content';

export default {
	emailTitanAddMailboxes( pageContext, next ) {
		pageContext.primary = (
			<TitanRedirector
				mode={ pageContext.params.mode }
				jwt={ pageContext.query.jwt }
				redirectUrl={ pageContext.query.redirect_url }
			/>
		);

		next();
	},
	notFound( pageContext, next ) {
		pageContext.primary = (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'Uh oh. Page not found.' ) }
				line={ translate(
					"Sorry, the page you were looking for doesn't exist or has been moved."
				) }
			/>
		);

		next();
	},
};
