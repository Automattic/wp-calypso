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
		const feedId = 40474296;
		const siteId = null;
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/reader-site-stream-link">Reader Site Stream Link</a>
				</h2>
				<Card>
					<ReaderSiteStreamLink feedId={ feedId } siteId={ siteId }>futonbleu</ReaderSiteStreamLink>
				</Card>
			</div>
		);
	}
} );
