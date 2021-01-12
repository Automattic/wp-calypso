/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import TitanRedirector from 'calypso/my-sites/email/titan-redirector/titan-redirector';

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
};
