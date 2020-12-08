/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { sortBy, trimStart, isEmpty } from 'lodash';
import page from 'page';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ReaderImportButton from 'calypso/blocks/reader-import-button';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import InfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'calypso/reader/components/reader-infinite-stream/row-renderers';
import SyncReaderFollows from 'calypso/components/data/sync-reader-follows';
import FollowingManageSearchFollowed from './search-followed';
import FollowingManageSortControls from './sort-controls';
import { getReaderFollows, getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';
import UrlSearch from 'calypso/lib/url-search';
import { filterFollowsByQuery } from 'calypso/reader/follow-helpers';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { formatUrlForDisplay, getFeedTitle } from 'calypso/reader/lib/feed-display-helper';
import { addQueryArgs } from 'calypso/lib/url';
import { READER_SUBSCRIPTIONS } from 'calypso/reader/follow-sources';
import { READER_EXPORT_TYPE_SUBSCRIPTIONS } from 'calypso/blocks/reader-export-button/constants';

class FollowingManageSubscriptions extends Component {
	static propTypes = {
		follows: PropTypes.array.isRequired,
		doSearch: PropTypes.func.isRequired,
		query: PropTypes.string,
		sortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha' ] ),
		windowScrollerRef: PropTypes.func,
	};

	sortFollows( follows, sortOrder ) {
		if ( sortOrder === 'alpha' ) {
			return sortBy( follows, ( follow ) => {
				const feed = follow.feed;
				const site = follow.site;
				const displayUrl = formatUrlForDisplay( follow.URL );
				return trimStart( getFeedTitle( site, feed, displayUrl ).toLowerCase() );
			} );
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
								<ReaderExportButton borderless exportType={ READER_EXPORT_TYPE_SUBSCRIPTIONS } />
							</PopoverMenuItem>
						</EllipsisMenu>
					</div>
				</div>
				<div className={ subsListClassNames }>
					{ ! noSitesMatchQuery && (
						<InfiniteStream
							items={ sortedFollows }
							extraRenderItemProps={ {
								followSource: READER_SUBSCRIPTIONS,
							} }
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
