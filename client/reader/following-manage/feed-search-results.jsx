/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { take, map } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import ConnectedSubscriptionListItem from './connected-subscription-list-item';
import SitesWindowScroller from './sites-window-scroller';
import Button from 'components/button';

const FollowingManageSearchFeedsResults = ( {
	showMoreResults,
	showMoreResultsClicked,
	searchResults,
	translate,
	width,
	fetchNextPage,
	forceRefresh,
	searchResultsCount,
} ) => {
	if ( ! searchResults ) {
		return null; // todo: add placeholder
	} else if ( searchResults.length === 0 ) {
		return (
			<p>
				{ translate( 'There were no site results for your query.' ) }
			</p>
		);
	}

	if ( ! showMoreResults ) {
		const resultsToShow = map(
			take( searchResults, 10 ),
			site => (
				<ConnectedSubscriptionListItem
					url={ site.URL }
					feedId={ +site.feed_ID }
					siteId={ +site.blog_ID }
					key={ `search-result-site-id-${ site.feed_ID }` }
				/>
			)
		);

		return (
			<div className="following-manage__search-results">
				{ resultsToShow }
				<div className="following-manage__show-more">
					{ searchResultsCount > 3 && (
						<Button compact icon
							onClick={ showMoreResultsClicked }
							className="following-manage__show-more-button button">
								<Gridicon icon="chevron-down" />
								{ translate( 'Show more' ) }
						</Button>
					) }
				</div>
			</div>
		);
	}

	return (
		<div className="following-manage__search-results">
			<SitesWindowScroller
				sites={ searchResults }
				width={ width }
				fetchNextPage={ fetchNextPage }
				remoteTotalCount={ searchResultsCount }
				forceRefresh={ forceRefresh }
			/>
		</div>
	);
};

export default localize( FollowingManageSearchFeedsResults );
