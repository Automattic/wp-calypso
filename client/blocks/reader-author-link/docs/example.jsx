/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAuthorLink from 'client/blocks/reader-author-link';
import Card from 'client/components/card';

const ReaderAuthorLinkExample = () => {
	const author = { URL: 'http://wpcalypso.wordpress.com', name: 'Barnaby Blogwit' };

	return (
		<Card>
			<ReaderAuthorLink author={ author }>Author site</ReaderAuthorLink>
		</Card>
	);
};

ReaderAuthorLinkExample.displayName = 'ReaderAuthorLink';

export default ReaderAuthorLinkExample;
