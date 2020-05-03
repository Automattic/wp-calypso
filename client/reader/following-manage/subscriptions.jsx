/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { escapeRegExp, reverse, sortBy, trimStart, isEmpty } from 'lodash';
import page from 'page';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';
import ReaderExportButton from 'blocks/reader-export-button';
import InfiniteStream from 'reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'reader/components/reader-infinite-stream/row-renderers';
import SyncReaderFollows from 'components/data/sync-reader-follows';
import FollowingManageSearchFollowed from './search-followed';
import FollowingManageSortControls from './sort-controls';
import { getReaderFollows, getReaderFollowsCount } from 'state/reader/follows/selectors';
import UrlSearch from 'lib/url-search';
import { getSiteName, getSiteUrl, getSiteDescription, getSiteAuthorName } from 'reader/get-helpers';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { formatUrlForDisplay, getFeedTitle } from 'reader/lib/feed-display-helper';
import { addQueryArgs } from 'lib/url';
import { READER_SUBSCRIPTIONS } from 'reader/follow-sources';

class FollowingManageSubscriptions extends Component {
	static propTypes = {
		follows: PropTypes.array.isRequired,
		doSearch: PropTypes.func.isRequired,
		query: PropTypes.string,
		sortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha' ] ),
		windowScrollerRef: PropTypes.func,
	};

	filterFollowsByQuery( query ) {
		const { follows } = this.props;

		if ( ! query ) {
			return follows;
		}

		const phraseRe = new RegExp( escapeRegExp( query ), 'i' );

		return follows.filter( ( follow ) => {
			const feed = follow.feed;
			const site = follow.site;
			const siteName = getSiteName( { feed, site } );
			const siteUrl = getSiteUrl( { feed, site } );
			const siteDescription = getSiteDescription( { feed, site } );
			const siteAuthor = getSiteAuthorName( site );

			return (
				`${ follow.URL }${ siteName }${ siteUrl }${ siteDescription }${ siteAuthor }`.search(
					phraseRe
				) !== -1
			);
		} );
	}

	sortFollows( follows, sortOrder ) {
		if ( sortOrder === 'alpha' ) {
			return sortBy( follows, ( follow ) => {
				const feed = follow.feed;
				const site = follow.site;
				const displayUrl = formatUrlForDisplay( follow.URL );
				return trimStart( getFeedTitle( site, feed, displayUrl ).toLowerCase() );
			} );
		}

		return reverse( sortBy( follows, [ 'date_subscribed' ] ) );
	}

	handleSortChange = ( sort ) => {
		page.replace( addQueryArgs( { sort }, window.location.pathname + window.location.search ) );
	};

	render() {
		const { width, translate, query, followsCount, sortOrder } = this.props;
		const filteredFollows = this.filterFollowsByQuery( query );
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
						{ translate( '%(num)s Followed Sites', {
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
								<ReaderExportButton />
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
