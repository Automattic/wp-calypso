/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAuthorLink from 'components/reader-author-link';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'ReaderAuthorLink',

	render() {
		const post = { author: { URL: 'http://wpcalypso.wordpress.com' } };
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/reader-author-link">Reader Author Link</a>
				</h2>
				<Card>
					<ReaderAuthorLink post={ post }>Author site</ReaderAuthorLink>
				</Card>
			</div>
		);
	}
} );
