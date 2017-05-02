/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import escapeRegexp from 'escape-string-regexp';
import { reverse, sortBy, trimStart } from 'lodash';
import page from 'page';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';
import ReaderExportButton from 'blocks/reader-export-button';
import SitesWindowScroller from './sites-window-scroller';
import QueryReaderFollows from 'components/data/query-reader-follows';
import FollowingManageSearchFollowed from './search-followed';
import FollowingManageSortControls from './sort-controls';
import { getFeed as getReaderFeed } from 'state/reader/feeds/selectors';
import { getSite as getReaderSite } from 'state/reader/sites/selectors';
import { getReaderFollows, getReaderFollowsCount } from 'state/selectors';
import UrlSearch from 'lib/url-search';
import { getSiteName, getSiteUrl, getSiteDescription, getSiteAuthorName } from 'reader/get-helpers';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { formatUrlForDisplay, getFeedTitle } from 'reader/lib/feed-display-helper';
import { addQueryArgs } from 'lib/url';

class FollowingManageSubscriptions extends Component {
	static propTypes = {
		follows: PropTypes.array.isRequired,
		doSearch: PropTypes.func.isRequired,
		query: PropTypes.string,
		sortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha' ] ),
	};
	state = { forceRefresh: false };

	filterFollowsByQuery( query ) {
		const { getFeed, getSite, follows } = this.props;
		const phraseRe = new RegExp( escapeRegexp( query ), 'i' );

		return follows.filter( follow => {
			const feed = getFeed( follow.feed_ID ); // todo grab feed and site for current sub
			const site = getSite( follow.site_ID );
			const siteName = getSiteName( { feed, site } );
			const siteUrl = getSiteUrl( { feed, site } );
			const siteDescription = getSiteDescription( { feed, site } );
			const siteAuthor = getSiteAuthorName( site );

			return (
				`${ follow.URL }${ siteName }${ siteUrl }${ siteDescription }${ siteAuthor }`
			).search( phraseRe ) !== -1;
		} );
	}

	sortFollows( follows, sortOrder ) {
		const { getFeed, getSite } = this.props;

		if ( sortOrder === 'alpha' ) {
			return sortBy( follows, follow => {
				const feed = getFeed( follow.feed_ID );
				const site = getSite( follow.site_ID );
				const displayUrl = formatUrlForDisplay( follow.URL );
				return trimStart( getFeedTitle( site, feed, displayUrl ).toLowerCase() );
			} );
		}

		return reverse( sortBy( follows, [ 'date_subscribed' ] ) );
	}

	handleSortChange = ( sort ) => {
		page.replace( addQueryArgs( { sort }, window.location.pathname + window.location.search ) );
	};

	componentWillReceiveProps( nextProps ) {
		const forceRefresh = (
			( nextProps.query !== this.props.query ) ||
			( nextProps.sortOrder !== this.props.sortOrder )
		);
		this.setState( { forceRefresh } );
	}

	render() {
		const { follows, width, translate, query, followsCount, sortOrder } = this.props;
		const filteredFollows = this.filterFollowsByQuery( query );
		const sortedFollows = this.sortFollows( filteredFollows, sortOrder );

		return (
			<div className="following-manage__subscriptions">
				<QueryReaderFollows />
				<div className="following-manage__subscriptions-controls">
					<h1 className="following-manage__subscriptions-header">
						{
							translate( '%(num)s Followed Sites', {
								args: { num: followsCount }
							} )
						}
						</h1>
					<div className="following-manage__subscriptions-sort">
						<FollowingManageSortControls
							sortOrder={ sortOrder }
							onSortChange={ this.handleSortChange }
						/>
					</div>
					<div className="following-manage__subscriptions-search">
						<FollowingManageSearchFollowed onSearch={ this.props.doSearch } initialValue={ query } />
					</div>
					<div className="following-manage__subscriptions-import-export">
						<EllipsisMenu toggleTitle={ translate( 'More' ) } position="bottom">
							<PopoverMenuItem className="following-manage__subscriptions-import-export-menu-item">
								<ReaderImportButton />
							</PopoverMenuItem>
							<PopoverMenuItem className="following-manage__subscriptions-import-export-menu-item">
								<ReaderExportButton />
							</PopoverMenuItem>
						</EllipsisMenu>
					</div>
				</div>
				<div className="following-manage__subscriptions-list">
					{ follows &&
						<SitesWindowScroller
							sites={ sortedFollows }
							width={ width }
							remoteTotalCount={ sortedFollows.length }
							forceRefresh={ this.state.forceRefresh }
						/>
					}
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const follows = getReaderFollows( state );
	const followsCount = getReaderFollowsCount( state );
	const getFeed = feedId => getReaderFeed( state, feedId );
	const getSite = siteId => getReaderSite( state, siteId );

	return { follows, followsCount, getFeed, getSite };
};

export default connect(
	mapStateToProps,
)( localize( UrlSearch( FollowingManageSubscriptions ) ) );
