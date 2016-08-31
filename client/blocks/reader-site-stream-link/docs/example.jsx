/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'ReaderSiteStreamLink',

	render() {
		const feedId = 40474296;
		const siteId = null;
		return (
			<Card>
				<ReaderSiteStreamLink feedId={ feedId } siteId={ siteId }>futonbleu</ReaderSiteStreamLink>
			</Card>
		);
	}
} );
