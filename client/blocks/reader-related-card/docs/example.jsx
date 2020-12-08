/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import {
	RelatedPostsFromSameSite,
	RelatedPostsFromOtherSites,
} from 'calypso/components/related-posts';
import { Card } from '@automattic/components';

const LONGREADS_SITE_ID = 70135762;
const LONGREADS_POST_ID = 65877;

class RelatedPostCardExample extends React.Component {
	static displayName = 'RelatedPostCard';

	render() {
		return (
			<div className="design-assets__group">
				<Card>
					<div className="reader-related-card__blocks is-same-site">
						<h1 className="reader-related-card__heading">
							More in <a className="reader-related-card__link">Longreads</a>
						</h1>
						<RelatedPostsFromSameSite siteId={ LONGREADS_SITE_ID } postId={ LONGREADS_POST_ID } />
					</div>
					<div className="reader-related-card__blocks is-other-site">
						<h1 className="reader-related-card__heading">
							More in <a className="reader-related-card__link">WordPress.com</a>
						</h1>
						<RelatedPostsFromOtherSites siteId={ LONGREADS_SITE_ID } postId={ LONGREADS_POST_ID } />
					</div>
				</Card>
			</div>
		);
	}
}

export default RelatedPostCardExample;
