/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { take, map } from 'lodash';
import Gridicon from 'gridicons';
import classnames from 'classnames';

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
	query,
} ) => {
	const isEmpty = !! ( query && searchResults && searchResults.length === 0 );
	const classNames = classnames( 'following-manage__search-results', {
		'is-empty': !! isEmpty,
	} );

	if ( ! searchResults ) {
		return null; // todo: add placeholder
	} else if ( isEmpty ) {
		return (
			<div className={ classNames }>
				<p>
					{ translate( 'Sorry, no sites match {{strong}}%s.{{/strong}}', {
						components: { strong: <strong /> },
						args: query,
					} ) }
				</p>
			</div>
		);
	}

	if ( ! showMoreResults ) {
		const resultsToShow = map( take( searchResults, 10 ), site => (
			<ConnectedSubscriptionListItem
				url={ site.feed_URL || site.URL }
				feedId={ +site.feed_ID }
				siteId={ +site.blog_ID }
				key={ `search-result-site-id-${ site.feed_ID || 0 }-${ site.blog_ID || 0 }` }
			/>
		) );

		return (
			<div className={ classNames }>
				{ resultsToShow }
				<div className="following-manage__show-more">
					{ searchResultsCount > 3 &&
						<Button
							compact
							icon
							onClick={ showMoreResultsClicked }
							className="following-manage__show-more-button button"
						>
							<Gridicon icon="chevron-down" />
							{ translate( 'Show more' ) }
						</Button> }
				</div>
			</div>
		);
	}

	return (
		<div className={ classNames }>
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
