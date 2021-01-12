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
				environment={ pageContext.params.environment }
				linkType={ pageContext.params.linkType }
				orderId={ pageContext.params.orderId }
			/>
		);

		next();
	},
};
