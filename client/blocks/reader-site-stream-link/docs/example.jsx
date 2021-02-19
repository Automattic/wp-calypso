/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import { Card } from '@automattic/components';

export default class ReaderSiteStreamLinkExample extends React.Component {
	static displayName = 'ReaderSiteStreamLinkExample';

	render() {
		const feedId = 40474296;
		const siteId = null;
		return (
			<Card>
				<ReaderSiteStreamLink feedId={ feedId } siteId={ siteId }>
					futonbleu
				</ReaderSiteStreamLink>
			</Card>
		);
	}
}
