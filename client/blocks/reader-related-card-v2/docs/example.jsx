/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import { RelatedPostsFromSameSite, RelatedPostsFromOtherSites } from 'components/related-posts-v2';
import Card from 'components/card';

const LONGREADS_SITE_ID = 70135762;
const LONGREADS_POST_ID = 65877;

class RelatedPostCardv2Example extends React.Component {
	static displayName = 'RelatedPostCardv2';

	render() {
		return (
			<div className="design-assets__group">
				<Card>
					<div className="reader-related-card-v2__blocks is-same-site">
						<h1 className="reader-related-card-v2__heading">More in <a className="reader-related-card-v2__link">Longreads</a></h1>
							<RelatedPostsFromSameSite
								siteId={ LONGREADS_SITE_ID }
								postId={ LONGREADS_POST_ID }
							/>
					</div>
					<div className="reader-related-card-v2__blocks is-other-site">
						<h1 className="reader-related-card-v2__heading">More in <a className="reader-related-card-v2__link">WordPress.com</a></h1>
							<RelatedPostsFromOtherSites
								siteId={ LONGREADS_SITE_ID}
								postId={ LONGREADS_POST_ID }
							/>
					</div>
				</Card>
			</div>
		);
	}
}

export default RelatedPostCardv2Example;
