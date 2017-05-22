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
import { READER_FOLLOWING_MANAGE_SEARCH_RESULT } from 'reader/follow-button/follow-sources';
import { recordTracksRailcarRender } from 'reader/stats';

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
	const isEmpty = !! ( query && query.length > 0 && searchResults && searchResults.length === 0 );
	const classNames = classnames( 'following-manage__search-results', {
		'is-empty': isEmpty,
	} );

	if ( ! searchResults ) {
		return null; // todo: add placeholder
	} else if ( isEmpty ) {
		return (
			<div className={ classNames }>
				{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
					components: { italic: <i /> },
					args: query,
				} ) }
			</div>
		);
	}

	function recordResultRender( index ) {
		return function( railcar ) {
			recordTracksRailcarRender(
				'following_manage_search',
				railcar,
				{ ui_algo: 'following_manage_search', ui_position: index }
			);
		};
	}

	if ( ! showMoreResults ) {
		const resultsToShow = map(
			take( searchResults, 10 ),
			( site, index ) => (
				<ConnectedSubscriptionListItem
					showLastUpdatedDate={ false }
					url={ site.feed_URL || site.URL }
					feedId={ +site.feed_ID }
					siteId={ +site.blog_ID }
					key={ `search-result-site-id-${ site.feed_ID || 0 }-${ site.blog_ID || 0 }` }
					followSource={ READER_FOLLOWING_MANAGE_SEARCH_RESULT }
					railcar={ site.railcar }
					onRender={ recordResultRender( index ) }
				/>
			)
		);

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
				showLastUpdatedDate={ false }
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
