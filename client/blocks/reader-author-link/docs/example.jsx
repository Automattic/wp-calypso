/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAuthorLink from 'blocks/reader-author-link';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'ReaderAuthorLink',

	render() {
		const author = { URL: 'http://wpcalypso.wordpress.com' };
		return (
			<Card>
				<ReaderAuthorLink author={ author }>Author site</ReaderAuthorLink>
			</Card>
		);
	}
} );
