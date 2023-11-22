import page from '@automattic/calypso-router';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { sortBy, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_SUBSCRIPTIONS } from 'calypso/blocks/reader-export-button/constants';
import ReaderImportButton from 'calypso/blocks/reader-import-button';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { addQueryArgs } from 'calypso/lib/url';
import UrlSearch from 'calypso/lib/url-search';
import InfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'calypso/reader/components/reader-infinite-stream/row-renderers';
import { filterFollowsByQuery } from 'calypso/reader/follow-helpers';
import { formatUrlForDisplay, getFeedTitle } from 'calypso/reader/lib/feed-display-helper';
import { getReaderFollows, getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';
import FollowingManageSearchFollowed from './search-followed';
import FollowingManageSortControls from './sort-controls';

class FollowingManageSubscriptions extends Component {
	static propTypes = {
		follows: PropTypes.array.isRequired,
		doSearch: PropTypes.func.isRequired,
		query: PropTypes.string,
		sortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha', 'date-updated' ] ),
		windowScrollerRef: PropTypes.func,
	};

	sortFollows( follows, sortOrder ) {
		if ( sortOrder === 'alpha' ) {
			return sortBy( follows, ( follow ) => {
				const feed = follow.feed;
				const site = follow.site;
				const displayUrl = formatUrlForDisplay( follow.URL );
				return getFeedTitle( site, feed, displayUrl ).toLowerCase().trimStart();
			} );
		}

		if ( sortOrder === 'date-updated' ) {
			return sortBy( follows, ( follow ) => {
				let last_update = 0;
				if ( follow.date_subscribed && ! isNaN( follow.date_subscribed ) ) {
					last_update = follow.date_subscribed;
				}
				if ( follow.last_updated && ! isNaN( follow.last_updated ) ) {
					last_update = follow.last_updated;
				}
				if ( follow.feed && follow.feed.last_update && ! isNaN( follow.feed.last_update ) ) {
					last_update = follow.feed.last_update;
				}
				return last_update;
			} ).reverse();
		}

		return sortBy( follows, [ 'date_subscribed' ] ).reverse();
	}

	handleSortChange = ( sort ) => {
		page.replace( addQueryArgs( { sort }, window.location.pathname + window.location.search ) );
	};

	render() {
		const { width, translate, query, followsCount, sortOrder } = this.props;
		const filteredFollows = filterFollowsByQuery( query, this.props.follows );
		const sortedFollows = this.sortFollows( filteredFollows, sortOrder );
		const noSitesMatchQuery = isEmpty( sortedFollows );
		const subsListClassNames = classnames( 'following-manage__subscriptions-list', {
			'is-empty': noSitesMatchQuery,
		} );

		return (
			<div className="following-manage__subscriptions">
				<SyncReaderFollows />
				<div className="following-manage__subscriptions-controls">
					<h1 className="following-manage__subscriptions-header">
						{ translate( '%(num)s Followed sites', {
							args: { num: followsCount },
						} ) }
					</h1>
					<div className="following-manage__subscriptions-sort">
						<FollowingManageSortControls
							sortOrder={ sortOrder }
							onSortChange={ this.handleSortChange }
						/>
					</div>
					<div className="following-manage__subscriptions-search">
						<FollowingManageSearchFollowed
							onSearch={ this.props.doSearch }
							initialValue={ query }
						/>
					</div>
					<div className="following-manage__subscriptions-import-export">
						<EllipsisMenu toggleTitle={ translate( 'More' ) } position="bottom">
							<PopoverMenuItem
								className="following-manage__subscriptions-import-export-menu-item"
								itemComponent="div"
							>
								<ReaderImportButton />
							</PopoverMenuItem>
							<PopoverMenuItem
								className="following-manage__subscriptions-import-export-menu-item"
								itemComponent="div"
							>
								<ReaderExportButton exportType={ READER_EXPORT_TYPE_SUBSCRIPTIONS } />
							</PopoverMenuItem>
						</EllipsisMenu>
					</div>
				</div>
				<div className={ subsListClassNames }>
					{ ! noSitesMatchQuery && (
						<InfiniteStream
							items={ sortedFollows }
							width={ width }
							totalCount={ sortedFollows.length }
							windowScrollerRef={ this.props.windowScrollerRef }
							rowRenderer={ siteRowRenderer }
						/>
					) }
					{ noSitesMatchQuery && (
						<span>
							{ query
								? translate( 'Sorry, no followed sites match {{italic}}%s.{{/italic}}', {
										components: { italic: <i /> },
										args: query,
										comment: '%s is the user-entered search string. For example: "bananas"',
								  } )
								: translate( 'Sorry, no followed sites found.' ) }
						</span>
					) }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const follows = getReaderFollows( state );
	const followsCount = getReaderFollowsCount( state );
	return { follows, followsCount };
};

export default connect( mapStateToProps )( localize( UrlSearch( FollowingManageSubscriptions ) ) );
