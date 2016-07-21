/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderSiteStreamLink from 'components/reader-site-stream-link';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'ReaderSiteStreamLink',

	render() {
		const post = { feed_ID: 40474296 };
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/reader-site-stream-link">Reader Site Stream Link</a>
				</h2>
				<Card>
					<ReaderSiteStreamLink post={ post }>futonbleu</ReaderSiteStreamLink>
				</Card>
			</div>
		);
	}
} );
